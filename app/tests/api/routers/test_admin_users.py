from unittest.mock import patch
import uuid
from sqlmodel import Session, select
from fastapi.testclient import TestClient
from app.core.config import settings
from app.tests.utils.utils import random_email, random_lower_string
from app.core.security import verify_password
from app.db.users import User
from app.utils import generate_reset_token


def test_read_users(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    superuser_token_headers: dict[str, str],
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/admin/users", headers=superuser_token_headers
    )
    response = r.json()

    assert r.status_code == 200
    assert response["count"] == 2


def test_read_users_permission_denied(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/admin/users", headers=normal_user_token_headers
    )
    response = r.json()

    assert r.status_code == 403
    assert response["detail"] == "The user doesn't have enough privileges"


def test_read_user(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    email = settings.FIRST_SUPERUSER_EMAIL
    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()
    r = client.get(
        f"{settings.API_V1_STR}/admin/users/{db_user.id}",
        headers=superuser_token_headers,
    )
    response = r.json()

    assert r.status_code == 200
    assert response["email"] == email


def test_read_user_invalid_id(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    fake_id = uuid.uuid4()

    r = client.get(
        f"{settings.API_V1_STR}/admin/users/{fake_id}", headers=superuser_token_headers
    )
    response = r.json()

    assert r.status_code == 404
    assert response["detail"] == "The user can't exists in the system."


def test_read_user_permission_denied(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    email = settings.TEST_USER_EMAIL
    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()
    r = client.get(
        f"{settings.API_V1_STR}/admin/users/{db_user.id}",
        headers=normal_user_token_headers,
    )
    response = r.json()

    assert r.status_code == 403
    assert response["detail"] == "The user doesn't have enough privileges"


def test_create_user(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()

    data = {
        "email": email,
        "password": password,
        "username": username,
        "is_active": True,
        "is_superuser": False,
    }

    r = client.post(
        f"{settings.API_V1_STR}/admin/users", json=data, headers=superuser_token_headers
    )
    response = r.json()

    assert r.status_code == 201

    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()

    assert db_user is not None
    assert db_user.is_active is True
    assert db_user.is_superuser is False
    assert response["email"] == db_user.email
    assert verify_password(password, db_user.hashed_password)


def test_create_user_existing_email(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    superuser_token_headers: dict[str, str],
) -> None:
    email = settings.TEST_USER_EMAIL
    password = random_lower_string()
    username = random_lower_string()

    data = {
        "email": email,
        "password": password,
        "username": username,
        "is_active": True,
        "is_superuser": False,
    }

    r = client.post(
        f"{settings.API_V1_STR}/admin/users", json=data, headers=superuser_token_headers
    )
    response = r.json()

    assert r.status_code == 400
    assert (
        response["detail"] == "The user with this email already exists in the system."
    )


def test_create_user_permission_denied(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()

    data = {
        "email": email,
        "password": password,
        "username": username,
        "is_active": True,
        "is_superuser": False,
    }

    r = client.post(
        f"{settings.API_V1_STR}/admin/users",
        json=data,
        headers=normal_user_token_headers,
    )
    response = r.json()

    assert r.status_code == 403
    assert response["detail"] == "The user doesn't have enough privileges"


def test_enable_otp(
    client: TestClient,
    db: Session,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
) -> None:
    email = settings.TEST_USER_EMAIL
    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()
    r = client.post(
        f"{settings.API_V1_STR}/admin/users/2fa/enable/{db_user.id}",
        headers=superuser_token_headers,
    )

    assert r.status_code == 200


def test_enable_otp_wrong_id(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    fake_id = uuid.uuid4()
    r = client.post(
        f"{settings.API_V1_STR}/admin/users/2fa/enable/{fake_id}",
        headers=superuser_token_headers,
    )
    response = r.json()

    assert r.status_code == 404
    assert response["detail"] == "The user can't exists in the system."


def test_enable_otp_permission_denied(
    client: TestClient,
    db: Session,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
) -> None:
    email = settings.TEST_USER_EMAIL
    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()
    r = client.post(
        f"{settings.API_V1_STR}/admin/users/2fa/enable/{db_user.id}",
        headers=normal_user_token_headers,
    )
    response = r.json()

    assert r.status_code == 403
    assert response["detail"] == "The user doesn't have enough privileges"


def test_disable_otp(
    client: TestClient,
    db: Session,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
) -> None:
    email = settings.TEST_USER_EMAIL
    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()
    r = client.post(
        f"{settings.API_V1_STR}/admin/users/2fa/disable/{db_user.id}",
        headers=superuser_token_headers,
    )
    response = r.json()

    assert r.status_code == 200
    assert response["message"] == "Multi-factor authentication is disabled."


def test_disable_otp_wrong_id(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    fake_id = uuid.uuid4()
    r = client.post(
        f"{settings.API_V1_STR}/admin/users/2fa/disable/{fake_id}",
        headers=superuser_token_headers,
    )
    response = r.json()

    assert r.status_code == 404
    assert response["detail"] == "The user can't exists in the system."


def test_disable_otp_permission_denied(
    client: TestClient,
    db: Session,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
) -> None:
    email = settings.TEST_USER_EMAIL
    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()
    r = client.post(
        f"{settings.API_V1_STR}/admin/users/2fa/disable/{db_user.id}",
        headers=normal_user_token_headers,
    )
    response = r.json()

    assert r.status_code == 403
    assert response["detail"] == "The user doesn't have enough privileges"


def test_update_user_invalid_id(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    fake_id = uuid.uuid4()
    username = random_lower_string()
    data = {"username": username}
    r = client.patch(
        f"{settings.API_V1_STR}/admin/users/{fake_id}",
        json=data,
        headers=superuser_token_headers,
    )
    response = r.json()

    assert r.status_code == 404
    assert response["detail"] == "The user can't exists in the system."


def test_update_user_existing_email(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    email = settings.TEST_USER_EMAIL
    data = {"email": settings.FIRST_SUPERUSER_EMAIL}
    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()

    assert db_user is not None

    r = client.patch(
        f"{settings.API_V1_STR}/admin/users/{db_user.id}",
        json=data,
        headers=superuser_token_headers,
    )
    response = r.json()

    assert r.status_code == 409
    assert response["detail"] == "The user with this email already exists in the system"


def test_update_user(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()

    data = {
        "email": email,
        "password": password,
        "username": username,
        "is_active": True,
        "is_superuser": False,
    }

    r = client.post(
        f"{settings.API_V1_STR}/admin/users", json=data, headers=superuser_token_headers
    )
    response = r.json()

    assert r.status_code == 201

    new_email = random_email()
    data = {"email": new_email, "is_active": False}

    r2 = client.patch(
        f"{settings.API_V1_STR}/admin/users/{response['id']}",
        json=data,
        headers=superuser_token_headers,
    )

    assert r2.status_code == 200

    statement = select(User).where(User.email == new_email)
    db_user = db.exec(statement).first()

    assert db_user.email == new_email
    assert db_user.is_active is False


def test_update_user_permission_denied(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    fake_id = uuid.uuid4()
    username = random_lower_string()
    data = {"username": username}
    r = client.patch(
        f"{settings.API_V1_STR}/admin/users/{fake_id}",
        json=data,
        headers=normal_user_token_headers,
    )
    response = r.json()

    assert r.status_code == 403
    assert response["detail"] == "The user doesn't have enough privileges"


def test_change_password_invalid_id(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    fake_id = uuid.uuid4()
    new_password = random_lower_string()
    data = {"new_password": new_password}
    r = client.post(
        f"{settings.API_V1_STR}/admin/users/{fake_id}/change-password",
        json=data,
        headers=superuser_token_headers,
    )
    response = r.json()

    assert r.status_code == 404
    assert response["detail"] == "The user can't exists in the system."


def test_change_superuser_password(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    email = settings.FIRST_SUPERUSER_EMAIL
    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()

    assert db_user is not None

    new_password = random_lower_string()
    data = {"new_password": new_password}
    r = client.post(
        f"{settings.API_V1_STR}/admin/users/{db_user.id}/change-password",
        json=data,
        headers=superuser_token_headers,
    )
    response = r.json()

    assert r.status_code == 403
    assert response["detail"] == "Use the personal password-change endpoint."


def test_change_password(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()

    data = {
        "email": email,
        "password": password,
        "username": username,
        "is_active": True,
        "is_superuser": False,
    }

    r = client.post(
        f"{settings.API_V1_STR}/admin/users", json=data, headers=superuser_token_headers
    )
    response = r.json()

    assert r.status_code == 201

    new_password = random_lower_string()
    data = {"new_password": new_password}

    r2 = client.post(
        f"{settings.API_V1_STR}/admin/users/{response['id']}/change-password",
        json=data,
        headers=superuser_token_headers,
    )
    response2 = r2.json()
    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()

    assert r2.status_code == 200
    assert response2["message"] == "User password successfully changed."
    assert verify_password(new_password, db_user.hashed_password)


def test_change_password_permission_denied(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    fake_id = uuid.uuid4()
    new_password = random_lower_string()
    data = {"new_password": new_password}
    r = client.post(
        f"{settings.API_V1_STR}/admin/users/{fake_id}/change-password",
        json=data,
        headers=normal_user_token_headers,
    )
    response = r.json()

    assert r.status_code == 403
    assert response["detail"] == "The user doesn't have enough privileges"


def test_delete_user_invalid_id(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    fake_id = uuid.uuid4()
    r = client.delete(
        f"{settings.API_V1_STR}/admin/users/{fake_id}", headers=superuser_token_headers
    )
    response = r.json()

    assert r.status_code == 404
    assert response["detail"] == "The user can't exists in the system."


def test_delete_superuser(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    email = settings.FIRST_SUPERUSER_EMAIL
    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()

    assert db_user is not None

    r = client.delete(
        f"{settings.API_V1_STR}/admin/users/{db_user.id}",
        headers=superuser_token_headers,
    )
    response = r.json()

    assert r.status_code == 403
    assert response["detail"] == "You can not delete superuser account"


def test_delete_user(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()

    data = {
        "email": email,
        "password": password,
        "username": username,
        "is_active": True,
        "is_superuser": False,
    }

    r = client.post(
        f"{settings.API_V1_STR}/admin/users", json=data, headers=superuser_token_headers
    )
    response = r.json()

    assert r.status_code == 201

    r2 = client.delete(
        f"{settings.API_V1_STR}/admin/users/{response['id']}",
        headers=superuser_token_headers,
    )
    response2 = r2.json()

    assert r2.status_code == 200
    assert response2["message"] == "User deleted successfully."

    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()

    assert db_user is None


def test_delete_user_permission_denied(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    normal_user_token_headers: dict[str, str],
    db: Session,
) -> None:
    email = settings.FIRST_SUPERUSER_EMAIL
    statement = select(User).where(User.email == email)
    db_user = db.exec(statement).first()

    assert db_user is not None

    r = client.delete(
        f"{settings.API_V1_STR}/admin/users/{db_user.id}",
        headers=normal_user_token_headers,
    )
    response = r.json()

    assert r.status_code == 403
    assert response["detail"] == "The user doesn't have enough privileges"
