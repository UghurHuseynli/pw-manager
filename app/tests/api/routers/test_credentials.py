from sqlmodel import Session, select
import uuid
from fastapi.testclient import TestClient
from app.tests.utils.utils import random_email, random_lower_string
from app.core.config import settings
from app.crud import credentials as crud_credentials
from app.db.credentials import Credentials


def test_get_credentials(
    client: TestClient,
    credential: Credentials,
    normal_user_token_headers: dict[str, str],
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/credentials", headers=normal_user_token_headers
    )
    credentials_response = r.json()

    assert 200 <= r.status_code < 300
    assert credentials_response["count"] == 1


def test_get_credential_by_id(
    client: TestClient,
    credential: Credentials,
    normal_user_token_headers: dict[str, str],
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/credentials/{credential.id}",
        headers=normal_user_token_headers,
    )
    credentials_response = r.json()

    assert 200 <= r.status_code < 300
    assert credentials_response["id"] == str(credential.id)


def test_get_credential_by_id_not_found(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    fake_id = uuid.uuid4()
    r = client.get(
        f"{settings.API_V1_STR}/credentials/{fake_id}",
        headers=normal_user_token_headers,
    )
    response = r.json()

    assert r.status_code == 404
    assert response["detail"] == "Credential not found"


def test_create_credential(
    client: TestClient, db: Session, normal_user_token_headers: dict[str, str]
) -> None:
    title = random_lower_string()
    url = random_lower_string()
    notes = random_lower_string()
    username = random_email()
    password = random_lower_string()
    data = {
        "title": title,
        "url": url,
        "notes": notes,
        "username": username,
        "password": password,
    }
    r = client.post(
        f"{settings.API_V1_STR}/credentials",
        headers=normal_user_token_headers,
        json=data,
    )
    credentials_response = r.json()

    assert r.status_code == 201
    db_credentials = crud_credentials.get_credentials_by_id(
        session=db, credential_id=uuid.UUID(credentials_response["id"])
    )
    assert db_credentials.title == credentials_response["title"]


def test_update_credential(
    client: TestClient,
    db: Session,
    normal_user_token_headers: dict[str, str],
    credential: Credentials,
) -> None:
    new_title = random_lower_string()
    new_url = random_lower_string()
    data = {"title": new_title, "url": new_url}
    r = client.patch(
        f"{settings.API_V1_STR}/credentials/{credential.id}",
        headers=normal_user_token_headers,
        json=data,
    )
    credentials_response = r.json()
    assert r.status_code == 200
    db_credentials = crud_credentials.get_credentials_by_id(
        session=db, credential_id=credential.id
    )
    db.refresh(db_credentials)
    assert db_credentials.id == uuid.UUID(credentials_response["id"])
    assert db_credentials.title == new_title
    assert db_credentials.url == new_url


def test_update_credential_not_found(
    client: TestClient, db: Session, normal_user_token_headers: dict[str, str]
) -> None:
    fake_id = uuid.uuid4()
    new_title = random_lower_string()
    data = {"title": new_title}
    r = client.patch(
        f"{settings.API_V1_STR}/credentials/{fake_id}",
        headers=normal_user_token_headers,
        json=data,
    )
    response = r.json()

    assert r.status_code == 404
    assert response["detail"] == "Credential not found"


def test_delete_credential(
    client: TestClient,
    db: Session,
    credential: Credentials,
    normal_user_token_headers: dict[str, str],
) -> None:
    r = client.delete(
        f"{settings.API_V1_STR}/credentials/{credential.id}",
        headers=normal_user_token_headers,
    )
    response = r.json()

    r.status_code == 200
    response["message"] == "Credential deleted successfully"


def test_delete_credential_not_found(
    client: TestClient, db: Session, normal_user_token_headers: dict[str, str]
) -> None:
    fake_id = uuid.uuid4()
    r = client.delete(
        f"{settings.API_V1_STR}/credentials/{fake_id}",
        headers=normal_user_token_headers,
    )
    response = r.json()

    r.status_code == 200
    response["detail"] == "Credential not found"
