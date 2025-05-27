from unittest.mock import patch
from sqlmodel import Session, select
from fastapi.testclient import TestClient
from app.core.config import settings
from app.tests.utils.utils import random_email, random_lower_string
from app.core.security import verify_password
from app.db.users import User
from app.utils import generate_reset_token


def test_read_users() -> None:
    pass


def test_read_users_permission_denied() -> None:
    pass


def test_read_user() -> None:
    pass


def test_read_user_invalid_id() -> None:
    pass


def test_read_user_permission_denied() -> None:
    pass


def test_create_user() -> None:
    pass


def test_create_user_existing_email() -> None:
    pass


def test_create_user_permission_denied() -> None:
    pass


def test_create_user_permission_denied() -> None:
    pass


def test_update_user_invalid_id() -> None:
    pass


def test_update_user_existing_email() -> None:
    pass


def test_update_user() -> None:
    pass


def test_update_user_permission_denied() -> None:
    pass


def test_change_password_invalid_id() -> None:
    pass


def test_change_superuser_password() -> None:
    pass


def test_change_password() -> None:
    pass


def test_change_password_permission_denied() -> None:
    pass


def test_delete_user_invalid_id() -> None:
    pass


def test_delete_superuser() -> None:
    pass


def test_delete_user() -> None:
    pass


def test_delete_user_permission_denied() -> None:
    pass
