from unittest.mock import patch
from sqlmodel import Session, select
from fastapi.testclient import TestClient
from app.core.config import settings
from app.tests.utils.utils import random_email, random_lower_string
from app.core.security import verify_password
from app.db.users import User
from app.utils import generate_reset_token


def test_get_users_me(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    current_user = r.json()
    print(current_user)
    assert current_user
    assert current_user["is_active"] is True
    assert current_user["email"] == settings.TEST_USER_EMAIL


def test_get_users_me_wrong_token(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    wrong_token_headers = {"Authorization": f"Bearer {random_lower_string()}"}
    r = client.get(f"{settings.API_V1_STR}/users/me", headers=wrong_token_headers)
    assert r.status_code == 403
    assert r.json() == {"detail": "Could not validate credentials"}


def test_register_and_activate_users(client: TestClient, db: Session) -> None:
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
        assert new_user["email"] == email

        user_query = select(User).where(User.email == email)
        db_user = db.exec(user_query).first()

        assert db_user
        assert db_user.email == email
        assert db_user.username == username
        assert db_user.is_active is False
        assert db_user.is_superuser is False
        assert verify_password(password, db_user.hashed_password)

        # Activate
        token = generate_reset_token(email=email)

        r2 = client.post(f"{settings.API_V1_STR}/users/activate?token={token}")
        activated_user = r2.json()
        assert activated_user
        assert activated_user["email"] == email
        assert activated_user["is_active"] is True


def test_register_with_existing_email(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    email = settings.TEST_USER_EMAIL
    password = random_lower_string()
    username = random_lower_string()

    data = {"email": email, "username": username, "password": password}
    r = client.post(f"{settings.API_V1_STR}/users/signup", json=data)
    response = r.json()

    assert 400 <= r.status_code < 500
    assert (
        response["detail"] == "The user with this email already exists in the system."
    )


def test_change_password_with_old_password(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    old_password = settings.TEST_USER_PASSWORD
    new_password = old_password
    data = {"old_password": old_password, "new_password": new_password}
    r = client.post(
        f"{settings.API_V1_STR}/users/me/change-password",
        headers=normal_user_token_headers,
        json=data,
    )
    response = r.json()
    assert r.status_code == 400
    assert response["detail"] == {
        "new_password": "New password must be different from the old one"
    }


def test_change_password_with_incorrect_old_password(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    incorrect_old_password = random_lower_string()
    new_password = random_lower_string()
    data = {"old_password": incorrect_old_password, "new_password": new_password}
    r = client.post(
        f"{settings.API_V1_STR}/users/me/change-password",
        headers=normal_user_token_headers,
        json=data,
    )
    response = r.json()
    assert r.status_code == 400
    assert response["detail"] == {"old_password": "Password is not matched"}


def test_change_password(
    client: TestClient, db: Session, normal_user_token_headers: dict[str, str]
) -> None:
    new_password = random_lower_string()
    data = {"old_password": settings.TEST_USER_PASSWORD, "new_password": new_password}

    r = client.post(
        f"{settings.API_V1_STR}/users/me/change-password",
        headers=normal_user_token_headers,
        json=data,
    )
    assert 200 <= r.status_code < 300

    user_query = select(User).where(User.email == settings.TEST_USER_EMAIL)
    updated_user = db.exec(user_query).first()

    assert updated_user
    assert verify_password(new_password, updated_user.hashed_password)


def test_update_user(
    client: TestClient, db: Session, normal_user_token_headers: dict[str, str]
) -> None:
    new_username = random_lower_string()
    email = random_email()
    data = {"username": new_username, "email": email}

    r = client.patch(
        f"{settings.API_V1_STR}/users/me",
        headers=normal_user_token_headers,
        json=data,
    )
    assert 200 <= r.status_code < 300

    user_query = select(User).where(User.email == email)
    updated_user = db.exec(user_query).first()

    assert updated_user
    assert updated_user.username == new_username
    assert updated_user.email == email


def test_update_user_with_existing_email(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    with (
        patch("app.utils.send_email", return_value=None),
        patch("app.core.config.settings.SMTP_HOST", "smtp.example.com"),
        patch("app.core.config.settings.SMTP_USER", "admin@example.com"),
    ):
        email = random_email()
        password = random_lower_string()
        username = random_lower_string()
        new_user = {
            "email": email,
            "username": username,
            "password": password,
        }
        r = client.post(f"{settings.API_V1_STR}/users/signup", json=new_user)
        assert r.status_code == 201
        assert r.json()["email"] == email

        data = {"email": email}
        r = client.patch(
            f"{settings.API_V1_STR}/users/me",
            headers=normal_user_token_headers,
            json=data,
        )
        response = r.json()

        assert r.status_code == 409
        assert response["detail"] == "User with this email already exists"


def test_delete_user_me(
    client: TestClient, db: Session, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.delete(
        f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers
    )
    assert r.status_code == 200
    statement = select(User).where(User.email == settings.TEST_USER_EMAIL)
    deleted_user = db.exec(statement).first()
    assert deleted_user is None
