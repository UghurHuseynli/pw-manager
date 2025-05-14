from fastapi import APIRouter, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Any
from app.db.users import (
    User,
    UserPublic,
    UserCreate,
    UserUpdate,
    UserRegister,
    UserSignUpResponse,
)
from app.crud import users as crud_users
from app.api.dependencies import SessionDep, CurrentUser
from app.utils import (
    generate_reset_token,
    generate_new_account_activate_email,
    send_email,
)
from app.core.config import settings


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


@router.get("/me", response_model=UserPublic)
def read_user_me(*, current_user: CurrentUser) -> Any:
    """Get current user."""
    return current_user


