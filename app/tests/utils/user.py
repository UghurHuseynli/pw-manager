from fastapi.testclient import TestClient
from sqlmodel import Session

from app.crud import users as crud_users
from app.core.config import settings
from app.db.users import User, UserUpdate, UserCreate
from app.tests.utils.utils import random_lower_string, random_email


def user_authentication_headers(
    *, client: TestClient, email: str, password: str
) -> dict[str, str]:
    data = {"username": email, "password": password}
    response = client.post(f"{settings.API_V1_STR}/login/access-token", data=data)
    payload = response.json()
    auth_token = payload["access_token"]
    headers = {"Authorization": f"Bearer {auth_token}"}
    return headers


def create_random_user(db: Session) -> User:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()
    user_in = UserCreate(
        username=username,
        email=email,
        password=password,
    )
    user = crud_users.create_user(db=db, user_create=user_in)
    return user


def authentication_token_from_email(
    *, client: TestClient, email: str, password: str, db: Session
) -> dict[str, str]:
    """
    Return a valid token for the user with given email.

    If the user doesn't exist it is created first.
    """
    user = crud_users.get_user_by_email(session=db, email=email)
    if not user:
        username = random_lower_string()
        user_in = UserCreate(
            username=username,
            email=email,
            password=password,
            is_active=True,
        )
        user = crud_users.create_user(session=db, user_create=user_in)
    else:
        user_in_update = UserUpdate(password=password)
        if not user.id:
            raise ValueError("User has no id")
        user = crud_users.update_user(session=db, db_user=user, user_in=user_in_update)

    return user_authentication_headers(client=client, email=email, password=password)
