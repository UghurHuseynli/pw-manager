from collections.abc import Generator
from sqlalchemy.exc import ProgrammingError, OperationalError
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, delete, create_engine, SQLModel, text
from app.main import app
from app.api.dependencies import get_db
from app.core.config import settings
from app.core.db import init_db
from app.db.users import User
from app.db.credentials import Credentials
from app.crud import users as crud_users
from app.tests.utils.user import authentication_token_from_email
from app.tests.utils.utils import get_superuser_token_headers
from app.tests.utils.credentials import create_random_credentials


TEST_DATABASE_URL = str(settings.SQLALCHEMY_TEST_DATABASE_URI)
admin_engine = create_engine(
    str(settings.SQLALCHEMY_DATABASE_URI), isolation_level="AUTOCOMMIT"
)
engine = create_engine(TEST_DATABASE_URL)


def create_test_database():
    """Create the test database if it doesn't exist."""
    with admin_engine.connect() as connection:
        try:
            connection.execute(
                text(f'CREATE DATABASE "{TEST_DATABASE_URL.split("/")[-1]}"')
            )
        except ProgrammingError:
            print("Database already exists, continuing...")
        except OperationalError:
            print("Database can not create.")


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """
    Create the test database schema before any tests run,
    and drop it after all tests are done.
    """
    create_test_database()
    SQLModel.metadata.create_all(bind=engine)
    yield
    SQLModel.metadata.drop_all(bind=engine)


_current_session = None


@pytest.fixture(scope="function", autouse=True)
def db() -> Generator[Session, None, None]:
    """
    Create a new database session for each test and clean up after.
    """
    global _current_session

    with Session(engine) as session:
        init_db(session=session)
        _current_session = session
        yield session
        try:
            session.exec(delete(Credentials))
            session.exec(delete(User))
            session.commit()
        except Exception as e:
            session.rollback()
            print(f"Cleanup error: {e}")
        finally:
            _current_session = None


@pytest.fixture(scope="function")
def client() -> Generator[TestClient, None, None]:
    def override_get_db():
        return _current_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def superuser_token_headers(client: TestClient) -> dict[str, str]:
    return get_superuser_token_headers(client)


@pytest.fixture(scope="function")
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client,
        email=settings.TEST_USER_EMAIL,
        password=settings.TEST_USER_PASSWORD,
        db=db,
    )


@pytest.fixture(scope="function")
def credential(
    client: TestClient, db: Session, normal_user_token_headers: dict[str, str]
) -> Credentials:
    normal_user = crud_users.get_user_by_email(
        session=db, email=settings.TEST_USER_EMAIL
    )
    return create_random_credentials(db=db, user_id=normal_user.id)
