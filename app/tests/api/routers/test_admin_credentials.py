from sqlmodel import Session, select
import uuid
from fastapi.testclient import TestClient
from app.tests.utils.utils import random_email, random_lower_string
from app.tests.utils.user import create_random_user
from app.core.config import settings
from app.crud import credentials as crud_credentials
from app.db.credentials import Credentials


def test_get_credentials(
    client: TestClient,
    credential: Credentials,
    superuser_token_headers: dict[str, str],
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/admin/credentials", headers=superuser_token_headers
    )
    credentials_response = r.json()

    assert 200 <= r.status_code < 300
    assert credentials_response["count"] == 1


def test_get_credentials_by_user_id(
    client: TestClient,
    credential: Credentials,
    normal_user_token_headers: dict[str, str],
    superuser_token_headers: dict[str, str],
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/credentials/{credential.id}",
        headers=superuser_token_headers,
    )


def test_get_credential_by_id(
    client: TestClient,
    credential: Credentials,
    superuser_token_headers: dict[str, str],
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/admin/credentials/{credential.id}",
        headers=superuser_token_headers,
    )
    credentials_response = r.json()

    assert 200 <= r.status_code < 300
    assert credentials_response["id"] == str(credential.id)


def test_get_credential_by_id_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    fake_id = uuid.uuid4()
    r = client.get(
        f"{settings.API_V1_STR}/admin/credentials/{fake_id}",
        headers=superuser_token_headers,
    )
    response = r.json()

    r.status_code == 404
    response["detail"] == "Credential not found"


def test_get_credential_by_id_permission_denied(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    credential: Credentials,
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/admin/credentials/{credential.id}",
        headers=normal_user_token_headers,
    )
    response = r.json()

    r.status_code == 403
    response["detail"] == "The user doesn't have enough privileges"


def test_create_credential(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    title = random_lower_string()
    url = random_lower_string()
    notes = random_lower_string()
    username = random_email()
    password = random_lower_string()
    user = create_random_user(db=db)
    data = {
        "title": title,
        "url": url,
        "notes": notes,
        "username": username,
        "password": password,
    }
    r = client.post(
        f"{settings.API_V1_STR}/admin/credentials?user_id={user.id}",
        headers=superuser_token_headers,
        json=data,
    )
    credentials_response = r.json()

    assert r.status_code == 201

    db_credentials = crud_credentials.get_credentials_by_id(
        session=db, credential_id=uuid.UUID(credentials_response["id"]), user_id=user.id
    )
    assert db_credentials is not None

    assert db_credentials.title == credentials_response["title"]
    assert db_credentials.user_id == uuid.UUID(credentials_response["user_id"])


def test_create_credential_user_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    title = random_lower_string()
    url = random_lower_string()
    notes = random_lower_string()
    username = random_email()
    password = random_lower_string()
    fake_id = uuid.uuid4()
    data = {
        "title": title,
        "url": url,
        "notes": notes,
        "username": username,
        "password": password,
    }
    r = client.post(
        f"{settings.API_V1_STR}/admin/credentials?user_id={fake_id}",
        headers=superuser_token_headers,
        json=data,
    )
    credentials_response = r.json()

    assert r.status_code == 404
    assert credentials_response["detail"] == "User not found."


def test_create_credential_permission_denied(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    title = random_lower_string()
    url = random_lower_string()
    notes = random_lower_string()
    username = random_email()
    password = random_lower_string()
    fake_id = uuid.uuid4()
    data = {
        "title": title,
        "url": url,
        "notes": notes,
        "username": username,
        "password": password,
    }
    r = client.post(
        f"{settings.API_V1_STR}/admin/credentials?user_id={fake_id}",
        headers=normal_user_token_headers,
        json=data,
    )
    credentials_response = r.json()

    assert r.status_code == 403
    assert credentials_response["detail"] == "The user doesn't have enough privileges"


def test_update_credential(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: Session,
    credential: Credentials,
) -> None:
    new_title = random_lower_string()
    new_url = random_lower_string()
    new_user = create_random_user(db=db)
    data = {"title": new_title, "url": new_url, "user_id": str(new_user.id)}

    r = client.patch(
        f"{settings.API_V1_STR}/admin/credentials/{credential.id}",
        headers=superuser_token_headers,
        json=data,
    )

    credentials_response = r.json()

    assert r.status_code == 200

    db_credentials = crud_credentials.get_credentials_by_id(
        session=db, credential_id=credential.id, user_id=new_user.id
    )
    db.refresh(db_credentials)

    assert db_credentials.id == uuid.UUID(credentials_response["id"])
    assert db_credentials.title == new_title
    assert db_credentials.url == new_url
    assert db_credentials.user_id == new_user.id


def test_update_credential_user_not_found(
    client: TestClient, superuser_token_headers: dict[str, str], credential: Credentials
) -> None:
    new_title = random_lower_string()
    new_url = random_lower_string()
    fake_id = uuid.uuid4()
    data = {"title": new_title, "url": new_url, "user_id": str(fake_id)}

    r = client.patch(
        f"{settings.API_V1_STR}/admin/credentials/{credential.id}",
        headers=superuser_token_headers,
        json=data,
    )

    credentials_response = r.json()

    assert r.status_code == 404
    assert credentials_response["detail"] == "User not found"


def test_update_credential_not_found(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    new_title = random_lower_string()
    new_url = random_lower_string()
    new_user = create_random_user(db=db)
    fake_id = uuid.uuid4()
    data = {"title": new_title, "url": new_url, "user_id": str(new_user.id)}

    r = client.patch(
        f"{settings.API_V1_STR}/admin/credentials/{fake_id}",
        headers=superuser_token_headers,
        json=data,
    )

    credentials_response = r.json()

    assert r.status_code == 404
    assert credentials_response["detail"] == "Credential not found"


def test_update_credential_permission_denied(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    new_title = random_lower_string()
    new_url = random_lower_string()
    fake_user_id = uuid.uuid4()
    fake_id = uuid.uuid4()
    data = {"title": new_title, "url": new_url, "user_id": str(fake_user_id)}

    r = client.patch(
        f"{settings.API_V1_STR}/admin/credentials/{fake_id}",
        headers=normal_user_token_headers,
        json=data,
    )

    credentials_response = r.json()

    assert r.status_code == 403
    assert credentials_response["detail"] == "The user doesn't have enough privileges"


def test_delete_credential(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    db: Session,
    credential: Credentials,
) -> None:
    r = client.delete(
        f"{settings.API_V1_STR}/admin/credentials/{credential.id}",
        headers=superuser_token_headers,
    )
    response = r.json()

    assert r.status_code == 200
    assert response["message"] == "Credential deleted successfully"

    db_credential = crud_credentials.get_credentials_by_id(
        session=db, credential_id=credential.id
    )

    assert db_credential is None


def test_delete_credential_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    fake_id = uuid.uuid4()
    r = client.delete(
        f"{settings.API_V1_STR}/admin/credentials/{fake_id}",
        headers=superuser_token_headers,
    )
    response = r.json()

    assert r.status_code == 404
    assert response["detail"] == "Credential not found"


def test_delete_credential_permission_denied(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    db: Session,
    superuser_token_headers: dict[str, str],
) -> None:
    title = random_lower_string()
    url = random_lower_string()
    notes = random_lower_string()
    username = random_email()
    password = random_lower_string()
    user = create_random_user(db=db)
    data = {
        "title": title,
        "url": url,
        "notes": notes,
        "username": username,
        "password": password,
    }
    r_create = client.post(
        f"{settings.API_V1_STR}/admin/credentials?user_id={user.id}",
        headers=superuser_token_headers,
        json=data,
    )
    credential_response = r_create.json()

    assert r_create.status_code == 201

    r = client.delete(
        f"{settings.API_V1_STR}/admin/credentials/{uuid.UUID(credential_response['id'])}",
        headers=normal_user_token_headers,
    )
    response = r.json()

    assert r.status_code == 403
    assert response["detail"] == "The user doesn't have enough privileges"
