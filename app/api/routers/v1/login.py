from app.api.dependencies import SessionDep
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Annotated
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm
import pyotp
from datetime import datetime, timezone
from app.crud.users import authenticate, get_user_by_email
from app.crud.base import save_to_db
from app.schemas.users import Token, Message, NewPassword
from app.core.security import create_access_token, get_password_hash
from app.core.config import settings
from app.utils import (
    generate_reset_token,
    generate_reset_password_email,
    verify_reset_token,
    send_email,
    OAuth2RequestWithOTP,
)


router = APIRouter(tags=["login"])


@router.post("/login/access-token")
def login_access_token(
    session: SessionDep, form_data: Annotated[OAuth2RequestWithOTP, Depends()]
) -> Token:
    """OAuth2 compatible token login, get an access token for future requests."""
    user = authenticate(
        session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif user.is_otp:
        if not form_data.otp or not pyotp.TOTP(user.otp_secret).verify(form_data.otp):
            raise HTTPException(401, "Invalid or missing OTP")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    user.last_login = datetime.now(timezone.utc)
    save_to_db(session=session, instance=user)

    return Token(
        access_token=create_access_token(
            subject=user.id, expires_delta=access_token_expires
        )
    )


@router.post("/password-recovery/{email}")
def password_recovery(
    session: SessionDep, email: str, background_tasks: BackgroundTasks
) -> Message:
    """Password recovery."""
    user = get_user_by_email(session=session, email=email)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )

    password_reset_token = generate_reset_token(email=email)

    email_data = generate_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )
    background_tasks.add_task(
        send_email,
        email_to=user.email,
        subject=email_data.subject,
        html_content=email_data.html_content,
    )
    return Message(message="Password recovery email sent. Please check your inbox.")


@router.post("/reset-password/")
def password_reset(session: SessionDep, body: NewPassword) -> Message:
    """Reset password."""
    email = verify_reset_token(token=body.token)
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Invalid token. Please request a new password recovery email.",
        )
    user = get_user_by_email(session=session, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    hashed_password = get_password_hash(body.new_password)
    user.hashed_password = hashed_password
    session.commit()
    return Message(message="Password updated successfully.")
