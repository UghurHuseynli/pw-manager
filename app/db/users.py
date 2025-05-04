from sqlmodel import SQLModel, Field
from datetime import datetime, timezone
from pydantic import EmailStr
import uuid


class UserBase(SQLModel):
    username: str = Field(unique=True)
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = Field(default=False)
    is_superuser: bool = Field(default=False)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    username: str = Field(unique=True)
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    password: str = Field(min_length=8, max_length=40)


class UserUpdate(UserBase):
    username: str | None = Field(default=None, unique=True)
    email: EmailStr | None = Field(
        default=None, unique=True, index=True, max_length=255
    )
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    username: str | None = Field(default=None, unique=True)
    email: EmailStr | None = Field(
        default=None, unique=True, index=True, max_length=255
    )


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashes_password: str
    created_at: datetime = Field(default_factory=timezone.utc)
    updated_at: datetime = Field(
        default_factory=timezone.utc, sa_column_kwargs={"onupdate": timezone.utc}
    )


class UserPublic(UserBase):
    id: uuid.UUID
