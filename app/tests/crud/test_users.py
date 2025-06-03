from fastapi.encoders import jsonable_encoder
from sqlmodel import Session
from app.db.users import User, UserCreate, UserUpdate, UserUpdateMe
from app.tests.utils.utils import random_lower_string, random_email
from app.crud import users as crud_users


def test_create_user(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()

    user_in = UserCreate(
        username=username,
        email=email,
        password=password,
    )
    user = crud_users.create_user(session=db, user_create=user_in)
    assert user.email == email
    assert user.username == username
    assert user.is_active is False
    assert user.is_superuser is False
    assert hasattr(user, "hashed_password")


def test_create_admin_user(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()

    user_in = UserCreate(
        username=username,
        email=email,
        password=password,
        is_active=True,
        is_superuser=True,
    )
    user = crud_users.create_user(session=db, user_create=user_in)
    assert user.email == email
    assert user.username == username
    assert user.is_active is True
    assert user.is_superuser is True
    assert hasattr(user, "hashed_password")


def test_authenticate_user(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()

    user_in = UserCreate(
        username=username,
        email=email,
        password=password,
    )
    user = crud_users.create_user(session=db, user_create=user_in)
    authenticated_user = crud_users.authenticate(
        session=db, email=email, password=password
    )
    assert authenticated_user
    assert authenticated_user.email == email
    assert authenticated_user.username == username


def test_not_authenticate_user(db: Session) -> None:
    email = random_email()
    password = random_lower_string()

    authenticated_user = crud_users.authenticate(
        session=db, email=email, password=password
    )
    assert authenticated_user is None


def test_user_is_active(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()

    user_in = UserCreate(
        username=username,
        email=email,
        password=password,
        is_active=True,
    )
    user = crud_users.create_user(session=db, user_create=user_in)
    assert user.is_active


def test_get_user(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()

    user_in = UserCreate(
        username=username,
        email=email,
        password=password,
    )
    user_1 = crud_users.create_user(session=db, user_create=user_in)
    user_2 = db.get(User, user_1.id)

    assert user_2
    assert user_1.email == user_2.email
    assert jsonable_encoder(user_1) == jsonable_encoder(user_2)


def test_get_user_by_email(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()

    user_in = UserCreate(
        username=username,
        email=email,
        password=password,
    )
    user_1 = crud_users.create_user(session=db, user_create=user_in)
    user_2 = crud_users.get_user_by_email(session=db, email=email)

    assert user_2
    assert user_1.email == user_2.email
    assert jsonable_encoder(user_1) == jsonable_encoder(user_2)


def test_update_user(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    username = random_lower_string()

    user_in = UserCreate(
        username=username,
        email=email,
        password=password,
    )
    user = crud_users.create_user(session=db, user_create=user_in)

    original_email = user.email
    original_username = user.username

    new_email = random_email()
    new_username = random_lower_string()
    user_in = UserUpdateMe(email=new_email, username=new_username)

    if user.id is not None:
        crud_users.update_user(session=db, db_user=user, user_in=user_in)

    user_2 = db.get(User, user.id)

    assert user_2 is not None
    assert user_2.email == new_email
    assert user_2.username == new_username

    assert user_2.email != original_email
    assert user_2.username != original_username
