from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
import uuid


class CredentialsBase(SQLModel):
    title: str
    url: str | None = Field(default=None)
    notes: str | None = Field(default=None, max_length=1000)


class CredentialsCreate(CredentialsBase):
    username: str
    password: str = Field(min_length=8, max_length=40)


class CredentialsUpdate(SQLModel):
    username: str | None = Field(default=None)
    password: str | None = Field(default=None, min_length=8, max_length=40)
    title: str | None = Field(default=None)
    url: str | None = Field(default=None)


class CredentialsAdminUpdate(CredentialsUpdate):
    user_id: uuid.UUID | None = Field(default=None)


class CredentialPublic(SQLModel):
    id: uuid.UUID
    title: str


class CredentialsPublic(SQLModel):
    count: int
    data: list[CredentialPublic]


class CredentialDetail(CredentialsBase):
    id: uuid.UUID
    username: str
    created_at: datetime
    updated_at: datetime


class CredentialAdminDetail(CredentialDetail):
    user_id: uuid.UUID


class Credentials(CredentialsBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    user: "User" = Relationship(back_populates="credentials")
    username: str
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


from app.db.users import User
