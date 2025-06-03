from sqlmodel import Session
from uuid import UUID
from app.tests.utils.user import create_random_user
from app.db.credentials import Credentials, CredentialsCreate
from app.tests.utils.utils import random_lower_string, random_email
from app.crud import credentials as crud_credentials


def create_random_credentials(db: Session, user_id: UUID = None) -> Credentials:
    owner_id = user_id
    if user_id is None:
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
    return credentials
