from fastapi import APIRouter, Depends, HTTPException, Response
from typing import Any
from sqlmodel import select, func
import pyotp
from app.db.users import UsersPublic, User, UserCreate, UserUpdate, AdminPublic
from app.schemas.users import Message
from app.api.dependencies import SessionDep, CurrentSuperUser
from app.crud import users as crud_users
from app.schemas.admin import ChangePassword
from app.core.security import get_password_hash
from app.core.config import settings
from app.crud.base import save_to_db
from uuid import UUID


router = APIRouter(prefix="/users", tags=["admin:users"])


@router.get("/", response_model=UsersPublic)
def read_users(*, session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """Retrive Users"""

    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()

    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return UsersPublic(data=users, count=count)


@router.get("/{user_id}", response_model=AdminPublic)
def read_user(*, session: SessionDep, user_id: UUID) -> Any:
    """Read user based on user_id"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404, detail="The user can't exists in the system."
        )
    return user


@router.post("/", response_model=AdminPublic, status_code=201)
def create_user(*, session: SessionDep, user_in: UserCreate) -> Any:
    """Create New Users"""

    user = crud_users.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user = crud_users.create_user(session=session, user_create=user_in)

    save_to_db(session=session, instance=user, refresh=True)
    return user


@router.post(
    "/2fa/enable/{user_id}",
    response_class=Response,
    responses={200: {"content": {"image/png": {}}, "description": "OTP QR code PNG"}},
)
def enable_2fa(session: SessionDep, user_id: UUID) -> Any:
    """Enable Multi-factor authenticaton for user based on user_id"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404, detail="The user can't exists in the system."
        )
    if not user.otp_secret:
        user.otp_secret = pyotp.random_base32()
    user.is_otp = True
    save_to_db(session=session, instance=user, refresh=True)

    res = crud_users.create_totp_qr(user=user, issuer_name=settings.PROJECT_NAME)
    return Response(res, media_type="image/png")


@router.post("/2fa/disable/{user_id}", response_model=Message)
def disable_2fa(session: SessionDep, user_id: UUID) -> Any:
    """Disable Multi-factor authentication for user based on user_id"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404, detail="The user can't exists in the system."
        )
    if user.is_otp:
        user.is_otp = False
        save_to_db(session=session, instance=user)
    return Message(message="Multi-factor authentication is disabled.")


@router.patch("/{user_id}", response_model=AdminPublic)
def update_user(*, session: SessionDep, user_id: UUID, user_in: UserUpdate) -> Any:
    """Update User data based on user_id"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404, detail="The user can't exists in the system."
        )
    if user_in.email:
        existing_user = crud_users.get_user_by_email(
            session=session, email=user_in.email
        )
        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409,
                detail="The user with this email already exists in the system",
            )
    user = crud_users.update_user(session=session, db_user=user, user_in=user_in)

    return user


@router.post("/{user_id}/change-password", response_model=Message)
def change_password(
    *,
    session: SessionDep,
    user_id: UUID,
    current_superuser: CurrentSuperUser,
    payload: ChangePassword,
) -> Any:
    """Change user password based on user_id"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404, detail="The user can't exists in the system."
        )
    if user.id == current_superuser.id:
        raise HTTPException(
            status_code=403, detail="Use the personal password-change endpoint."
        )

    user.hashed_password = get_password_hash(payload.new_password)
    save_to_db(session=session, instance=user)

    return Message(message="User password successfully changed.")


@router.delete("/{user_id}", response_model=Message)
def delete_user(*, session: SessionDep, user_id: UUID) -> Any:
    """Deletes a user from the system based on user_id"""

    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404, detail="The user can't exists in the system."
        )
    elif user.is_superuser:
        raise HTTPException(
            status_code=403, detail="You can not delete superuser account"
        )

    session.delete(user)
    session.commit()

    return Message(message="User deleted successfully.")
