from sqlmodel import SQLModel, Field, Relationship, Column, TIMESTAMP, func
from datetime import datetime, timezone
from pydantic import EmailStr
import uuid


class UserBase(SQLModel):
    username: str
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = Field(default=False)
    is_superuser: bool = Field(default=False)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    username: str
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    password: str = Field(min_length=8, max_length=40)


class UserUpdate(SQLModel):
    username: str | None = Field(default=None)
    email: EmailStr | None = Field(
        default=None, unique=True, index=True, max_length=255
    )
    is_active: bool | None = Field(default=None)
    is_superuser: bool | None = Field(default=None)


class UserUpdateMe(SQLModel):
    username: str | None = Field(default=None)
    email: EmailStr | None = Field(
        default=None, unique=True, index=True, max_length=255
    )


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime | None = Field(
        default=None,
        sa_column=Column(
            TIMESTAMP(timezone=True),
            nullable=True,
            server_default=None,
            server_onupdate=func.now(),
        ),
    )
    credentials: list["Credentials"] = Relationship(back_populates="user")
    last_login: datetime | None = Field(default=None)


class UserPublic(SQLModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    is_active: bool


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


class AdminPublic(UserBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime | None
    last_login: datetime | None


class UserSignUpResponse(UserPublic):
    message: str = Field(
        default="User created successfully and sending activation email. Please check your inbox."
    )


from app.db.credentials import Credentials
