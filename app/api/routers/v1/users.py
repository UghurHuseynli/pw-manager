from fastapi import APIRouter, HTTPException, BackgroundTasks, Response
from typing import Any
import pyotp, qrcode, io
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


@router.post("/signup", response_model=UserSignUpResponse, status_code=201)
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


@router.post(
    "/2fa/enable",
)
def enable_2fa(session: SessionDep, current_user: CurrentUser):
    if not current_user.otp_secret:
        current_user.otp_secret = pyotp.random_base32()
    current_user.is_otp_enabled = True
    save_to_db(session=session, instance=current_user, refresh=True)

    totp = pyotp.TOTP(current_user.otp_secret)
    uri = totp.provisioning_uri(
        name=current_user.username, issuer_name=settings.PROJECT_NAME
    )
    img = qrcode.make(uri)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return Response(buf.getvalue(), media_type="image/png")


@router.post("/2fa/disable", response_model=Message)
def disable_2fa(session: SessionDep, current_user: CurrentUser) -> Any:
    if current_user.is_otp_enabled:
        current_user.is_otp_enabled = False
        save_to_db(session=session, instance=current_user)
    return Message(message="2FA is disabled")


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

    if payload.old_password == payload.new_password:
        raise HTTPException(
            status_code=400,
            detail={"new_password": "New password must be different from the old one"},
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
