from passlib.context import CryptContext
from cryptography.fernet import Fernet
from jose import jwt
from typing import Any
from datetime import datetime, timedelta, timezone
from app.core.config import settings

key = settings.FERNET_KEY
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
fernet = Fernet(key.encode())


def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def get_credential_password_hash(password: str) -> str:
    return fernet.encrypt(password.encode()).decode()


def decrypt_credential_password(hashed_password: str) -> str:
    return fernet.decrypt(hashed_password.encode()).decode()
