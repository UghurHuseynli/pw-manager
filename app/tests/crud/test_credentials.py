from sqlmodel import Session
from app.db.credentials import (
    CredentialsCreate,
    CredentialsAdminUpdate,
)
from app.tests.utils import credentials as utils_credentials
from app.tests.utils.user import create_random_user
from app.tests.utils.utils import random_lower_string, random_email
from app.crud import credentials as crud_credentials


def test_get_credentials_by_id(db: Session) -> None:
    credentials = utils_credentials.create_random_credentials(db=db)

    credentials_from_db = crud_credentials.get_credentials_by_id(
        session=db, credential_id=credentials.id
    )

    assert credentials_from_db
    assert credentials_from_db.id == credentials.id
    assert credentials_from_db.user_id == credentials.user_id


def test_get_credentials_by_id_for_user(db: Session) -> None:
    credentials = utils_credentials.create_random_credentials(db=db)

    user_id = credentials.user_id

    credentials_from_db = crud_credentials.get_credentials_by_id(
        session=db, credential_id=credentials.id, user_id=user_id
    )

    assert credentials_from_db
    assert credentials_from_db.id == credentials.id
    assert credentials_from_db.user_id == user_id


def test_create_credentials(db: Session) -> None:
    user = create_random_user(db=db)
    owner_id = user.id
    assert owner_id is not None

    title = random_lower_string()
    url = random_lower_string()
    notes = random_lower_string()
    username = random_email()
    password = random_lower_string()

    credentials_in = CredentialsCreate(
        title=title, url=url, notes=notes, username=username, password=password
    )

    credentials = crud_credentials.create_credentials(
        session=db, credentials_create=credentials_in, user_id=owner_id
    )

    assert credentials is not None
    assert credentials.title == title
    assert credentials.url == url
    assert hasattr(credentials, "hashed_password")


def test_update_credentials(db: Session) -> None:
    credentials = utils_credentials.create_random_credentials(db=db)
    assert credentials is not None

    new_title = random_lower_string()
    new_password = random_lower_string()
    credentials_update = CredentialsAdminUpdate(title=new_title, password=new_password)
    updated_credentials = crud_credentials.update_credentials(
        session=db, db_credentials=credentials, credentials_in=credentials_update
    )
    db_credentials = crud_credentials.get_credentials_by_id(
        session=db, credential_id=credentials.id
    )

    assert updated_credentials is not None
    assert updated_credentials.id == credentials.id
    assert db_credentials.title == new_title
    assert db_credentials.hashed_password == updated_credentials.hashed_password
    assert credentials.username == db_credentials.username


def test_update_credentials_by_admin(db: Session) -> None:
    credentials = utils_credentials.create_random_credentials(db=db)
    assert credentials is not None
    user_new = create_random_user(db=db)
    assert user_new is not None

    new_title = random_lower_string()
    new_password = random_lower_string()
    credentials_update = CredentialsAdminUpdate(
        title=new_title, password=new_password, user_id=user_new.id
    )

    updated_credentials = crud_credentials.update_credentials(
        session=db, db_credentials=credentials, credentials_in=credentials_update
    )
    db_credentials = crud_credentials.get_credentials_by_id(
        session=db, credential_id=credentials.id
    )

    assert updated_credentials is not None
    assert updated_credentials.id == credentials.id
    assert db_credentials.title == new_title
    assert db_credentials.hashed_password == updated_credentials.hashed_password


def test_get_credentials_password(db: Session) -> None:
    user = create_random_user(db=db)
    owner_id = user.id
    assert owner_id is not None

    title = random_lower_string()
    url = random_lower_string()
    notes = random_lower_string()
    username = random_email()
    password = random_lower_string()

    credentials_in = CredentialsCreate(
        title=title, url=url, notes=notes, username=username, password=password
    )

    credentials = crud_credentials.create_credentials(
        session=db, credentials_create=credentials_in, user_id=owner_id
    )
    assert credentials is not None

    credentials_id = credentials.id
    credentials_password = crud_credentials.get_credential_password(
        session=db, user_id=credentials.user_id, credential_id=credentials_id
    )

    assert credentials_password is not None
    assert credentials_password == password
