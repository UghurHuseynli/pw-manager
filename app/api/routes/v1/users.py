from fastapi import APIRouter, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Any
from app.db.users import (
    User,
    UserPublic,
    UserCreate,
    UserUpdate,
    UserUpdateMe,
    UserRegister,
    UserSignUpResponse,
)
from app.schemas.users import Message, ChangePassword
from app.crud import users as crud_users
from app.api.dependencies import SessionDep, CurrentUser
from app.core.security import verify_password, get_password_hash
from app.utils import (
    generate_reset_token,
    generate_new_account_activate_email,
    send_email,
    verify_reset_token,
)
from app.core.config import settings
from app.crud.base import save_to_db


router = APIRouter(prefix="/users", tags=["users"])


@router.post("/signup", response_model=UserSignUpResponse)
def create_user(
    *, session: SessionDep, user_in: UserRegister, background_tasks: BackgroundTasks
) -> Any:
    """Create a new user."""

    user = crud_users.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user_create = UserCreate.model_validate(user_in)
    user = crud_users.create_user(session=session, user_create=user_create)

    activate_user_token = generate_reset_token(email=user.email)
    email_data = generate_new_account_activate_email(
        email_to=user.email,
        email=user.email,
        token=activate_user_token,
    )
    background_tasks.add_task(
        send_email,
        email_to=user.email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return user


@router.post("/activate", response_model=UserPublic)
def activate_user(*, session: SessionDep, token: str) -> Any:
    email = verify_reset_token(token=token)
    if not email:
        raise HTTPException(
            status=400,
            detail="Invalid token. Please request a new password recovery email.",
        )
    user = crud_users.get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    user.is_active = True
    save_to_db(session=session, instance=user, refresh=True)
    return user


@router.get("/me", response_model=UserPublic)
def read_user(*, current_user: CurrentUser) -> Any:
    """Get current user."""
    return current_user


@router.post("/me/change-password", response_model=Message)
def change_password(
    *, session: SessionDep, payload: ChangePassword, current_user: CurrentUser
):
    """Change own password"""

    if not verify_password(payload.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400, detail={"old_password": "Password is not matched"}
        )

    current_user.hashed_password = get_password_hash(payload.new_password)
    save_to_db(session=session, instance=current_user)
    return Message(message="Password changed successfully")


@router.patch("/me", response_model=UserPublic)
def update_user(
    *, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
) -> Any:
    """Update own user"""

    if user_in.email:
        existing_user = crud_users.get_user_by_email(
            session=session, email=user_in.email
        )
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )

    user = crud_users.update_user(
        session=session, db_user=current_user, user_in=user_in
    )
    return current_user


@router.delete("/me", response_model=Message)
def delete_user(*, session: SessionDep, current_user: CurrentUser) -> Any:
    """Delete own user"""

    if current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="Super users are not allowed to delete themselves"
        )
    session.delete(current_user)
    session.commit()

    return Message(message="User deleted successfully")
