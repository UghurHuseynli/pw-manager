from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from app.db.users import User, UserPublic, UserCreate, UserUpdate, UserRegister
from app.crud import users as crud_users
from app.api.dependencies import sessionDep


router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserPublic)
def create_user(*, session: sessionDep, user_in: UserRegister) -> Any:
    """Create a new user.

    Keyword arguments:
    user_in -- UserCreate object containing user data
    Return: UserPublic object with user data
    """

    user = crud_users.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user = crud_users.create_user(session=session, user_register=user_in)
    return user
