from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from sqlmodel import select, func
from app.db.users import UsersPublic, User, UserCreate, UserUpdate, AdminPublic
from app.schemas.users import Message
from app.api.dependencies import (
    SessionDep,
    get_current_active_superuser,
    CurrentSuperUser,
)
from app.crud import users as crud_users
from app.schemas.admin import ChangePassword
from app.core.security import get_password_hash
from uuid import UUID

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_active_superuser)],
)


@router.get("/users", response_model=UsersPublic)
def read_users(*, session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """Retrive Users"""

    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()

    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return UsersPublic(data=users, count=count)


@router.get("/users/{user_id}", response_model=AdminPublic)
def read_user(*, session: SessionDep, user_id: UUID) -> Any:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404, detail="The user can't exists in the system."
        )
    return user


@router.post("/users", response_model=AdminPublic)
def create_user(*, session: SessionDep, user_in: UserCreate) -> Any:
    """Create New Users"""

    user = crud_users.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user = crud_users.create_user(session=session, user_create=user_in)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.patch("/users/{user_id}", response_model=AdminPublic)
def update_user(*, session: SessionDep, user_id: UUID, user_in: UserUpdate) -> Any:
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=404, detail="The user can't exists in the system."
        )
    if user_in.email:
        existing_user = crud_users.get_user_by_email(
            session=session, email=user_in.email
        )
        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="The user with this email already exists in the system",
            )
    user_data = user_in.model_dump(exclude_unset=True)
    user.sqlmodel_update(user_data)

    session.add(user)
    session.commit()
    session.refresh(user)

    return user


@router.post("/users/{user_id}/change-password", response_model=Message)
def change_password(
    *,
    session: SessionDep,
    user_id: UUID,
    current_superuser: CurrentSuperUser,
    payload: ChangePassword,
) -> Any:
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
    session.add(user)
    user.commit()

    return Message(message="User password successfully changed.")


@router.delete("/users/{user_id}", response_model=Message)
def delete_user(*, session: SessionDep, user_id: UUID) -> Any:
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
