from unittest.mock import patch
from sqlmodel import Session, select
from fastapi.testclient import TestClient
from app.core.config import settings
from app.tests.utils.utils import random_email, random_lower_string
from app.core.security import verify_password
from app.db.users import User
from app.utils import generate_reset_token


def test_get_access_token(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    email = settings.TEST_USER_EMAIL
    password = settings.TEST_USER_PASSWORD
    data = {"username": email, "password": password}
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=data)
    token = r.json()

    assert token
    assert "access_token" in token
    assert token["access_token"] is not None
    assert r.status_code == 200


def test_get_access_token_with_wrong_credentials(client: TestClient) -> None:
    email = random_email()
    password = random_lower_string()
    data = {"username": email, "password": password}
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=data)
    response = r.json()

    assert r.status_code == 400
    assert response["detail"] == "Incorrect email or password"


def test_get_access_token_inactive_user(client: TestClient, db: Session):
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        # Register
        email = random_email()
        username = random_lower_string()
        password = random_lower_string()
        data = {"email": email, "username": username, "password": password}
        r = client.post(f"{settings.API_V1_STR}/users/signup", json=data)
        new_user = r.json()

        assert new_user

        user_query = select(User).where(User.email == email)
        db_user = db.exec(user_query).first()

        assert db_user.is_active is False
        access_data = {"username": email, "password": password}
        r2 = client.post(f"{settings.API_V1_STR}/login/access-token", data=access_data)

        assert r2.status_code == 400

        response = r2.json()

        assert response["detail"] == "Inactive user"


def test_password_recovery_with_wrong_email(client: TestClient) -> None:
    email = random_email()

    r = client.post(f"{settings.API_V1_STR}/password-recovery/{email}")
    response = r.json()

    assert r.status_code == 404
    assert (
        response["detail"] == "The user with this email does not exist in the system."
    )


def test_password_recovery(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        email = settings.TEST_USER_EMAIL

        r = client.post(f"{settings.API_V1_STR}/password-recovery/{email}")

        response = r.json()

        assert r.status_code == 200
        assert (
            response["message"]
            == "Password recovery email sent. Please check your inbox."
        )


def test_reset_password_incorrect_token(client: TestClient) -> None:
    reset_token = random_lower_string()
    password = random_lower_string()
    data = {"new_password": password, "token": reset_token}

    r = client.post(f"{settings.API_V1_STR}/reset-password", json=data)

    response = r.json()

    assert r.status_code == 400
    assert (
        response["detail"]
        == "Invalid token. Please request a new password recovery email."
    )


def test_reset_password_incorrect_email(client: TestClient) -> None:
    email = random_email()
    reset_token = generate_reset_token(email=email)
    password = random_lower_string()
    data = {"new_password": password, "token": reset_token}

    r = client.post(f"{settings.API_V1_STR}/reset-password", json=data)

    response = r.json()

    assert r.status_code == 404
    assert (
        response["detail"] == "The user with this email does not exist in the system."
    )


def test_reset_password_inactive_user(client: TestClient) -> None:
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        # Register
        email = random_email()
        username = random_lower_string()
        password = random_lower_string()
        data = {"email": email, "username": username, "password": password}
        r = client.post(f"{settings.API_V1_STR}/users/signup", json=data)

        assert r.status_code == 201

        reset_token = generate_reset_token(email=email)
        password = random_lower_string()
        data = {"new_password": password, "token": reset_token}

        r = client.post(f"{settings.API_V1_STR}/reset-password", json=data)

        response = r.json()

        assert r.status_code == 400
        assert response["detail"] == "Inactive user"


def test_reset_password_token(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    email = settings.TEST_USER_EMAIL
    reset_token = generate_reset_token(email=email)
    password = random_lower_string()
    data = {"new_password": password, "token": reset_token}
    r = client.post(f"{settings.API_V1_STR}/reset-password", json=data)

    response = r.json()

    assert r.status_code == 200
    assert response["message"] == "Password updated successfully."

    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()

    assert verify_password(password, db_user.hashed_password)
