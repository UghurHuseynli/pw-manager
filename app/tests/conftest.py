from collections.abc import Generator
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, delete
from app.main import app
from app.core.config import settings
from app.core.db import engine, init_db
from app.db.users import User
from app.db.credentials import Credentials
from app.tests.utils.user import authentication_token_from_email
from app.tests.utils.utils import get_superuser_token_headers


@pytest.fixture(scope="session", autouse=True)
def db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        init_db(session=session)
        yield session
        session.exec(delete(Credentials))
        session.exec(delete(User))
        session.commit()


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.TEST_USER_EMAIL, db=db
    )
