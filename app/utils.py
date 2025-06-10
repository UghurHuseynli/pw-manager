import logging
from app.core.config import settings
from typing import Any
from fastapi import Form
from fastapi.security import OAuth2PasswordRequestForm
from dataclasses import dataclass
from pathlib import Path
from jinja2 import Template
from jose import jwt
from jose.exceptions import JWTError
import emails
from datetime import timedelta, timezone, datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OAuth2RequestWithOTP(OAuth2PasswordRequestForm):
    def __init__(
        self,
        grant_type: str = Form(None),
        username: str = Form(...),
        password: str = Form(...),
        scope: str = Form(""),
        client_id: str | None = Form(None),
        client_secret: str | None = Form(None),
        otp: str | None = Form(None),
    ):
        super().__init__(
            grant_type=grant_type,
            username=username,
            password=password,
            scope=scope,
            client_id=client_id,
            client_secret=client_secret,
        )
        self.otp = otp


@dataclass
class EmailData:
    subject: str
    html_content: str


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_string = (
        Path(__file__).parent / "email-templates" / "build" / template_name
    ).read_text()
    html_content = Template(template_string).render(**context)
    return html_content


def send_email(*, email_to: str, subject: str = "", html_content: str = "") -> None:
    assert settings.emails_enabled, "no provided configuration for email variables"

    message = emails.Message(
        subject=subject,
        html=html_content,
        mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
    )

    smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}
    if settings.SMTP_TLS:
        smtp_options["tls"] = True
    if settings.SMTP_SSL:
        smtp_options["ssl"] = True
    if settings.SMTP_USER:
        smtp_options["user"] = settings.SMTP_USER
    if settings.SMTP_PASSWORD:
        smtp_options["password"] = settings.SMTP_PASSWORD

    response = message.send(to=email_to, smtp=smtp_options)
    logger.info(f"send email result: {response}")


def _generate_email(
    *,
    email_to: str,
    email: str,
    token: str,
    link: str,
    template_name: str,
    project_name: str,
) -> str:
    html_content = render_email_template(
        template_name=template_name,
        context={
            "project_name": project_name,
            "username": email,
            "link": link,
            "email": email_to,
            "valid_hours": settings.EMAIL_TOKEN_EXPIRE_HOURS,
        },
    )
    return html_content


def generate_reset_password_email(
    *, email_to: str, email: str, token: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} Password recovery for user {email}"
    link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    html_content = _generate_email(
        email_to=email_to,
        email=email,
        token=token,
        link=link,
        template_name="reset_password.html",
        project_name=project_name,
    )

    return EmailData(subject=subject, html_content=html_content)


def generate_new_account_activate_email(
    *, email_to: str, email: str, token: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} Account activation for user {email}"
    link = f"{settings.FRONTEND_URL}/activate?token={token}"
    html_content = _generate_email(
        email_to=email_to,
        email=email,
        token=token,
        link=link,
        template_name="new_account_activate.html",
        project_name=project_name,
    )

    return EmailData(subject=subject, html_content=html_content)


def generate_reset_token(*, email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_TOKEN_EXPIRE_HOURS)
    now = datetime.now(timezone.utc)
    expires = now + delta
    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        claims={"exp": exp, "nbf": now, "sub": email},
        key=settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def verify_reset_token(*, token: str) -> str | None:
    try:
        decoded_jwt = jwt.decode(
            token, key=settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return decoded_jwt["sub"]
    except JWTError:
        return None
