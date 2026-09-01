from datetime import timedelta
from jose import jwt
from app.core.config import settings
from app.core.security import (
    create_access_token,
    decrypt_credential_password,
    get_credential_password_hash,
    get_password_hash,
    verify_password,
)
from app.tests.utils.utils import random_lower_string


def test_password_hash_roundtrip() -> None:
    password = random_lower_string()
    hashed = get_password_hash(password)

    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password(random_lower_string(), hashed)


def test_credential_password_encrypt_roundtrip() -> None:
    password = random_lower_string()
    encrypted = get_credential_password_hash(password)

    assert encrypted != password
    assert decrypt_credential_password(encrypted) == password


def test_create_access_token_contains_subject() -> None:
    subject = "some-user-id"
    token = create_access_token(subject=subject, expires_delta=timedelta(minutes=5))

    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload["sub"] == subject
    assert payload["type"] == "access"
