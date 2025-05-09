from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
import uuid


class CredentialsBase(SQLModel):
    title: str
    url: str | None
    notes: str | None = Field(max_length=1000)


class CredentialsCreate(CredentialsBase):
    username: str
    password: str = Field(min_length=8, max_length=40)


class CredentialsUpdate(SQLModel):
    username: str | None
    password: str | None = Field(default=None, min_length=8, max_length=40)
    title: str | None
    url: str | None


class CredentialsPublic(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str


class Credentials(CredentialsBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    user: "User" = Relationship(back_populates="credentials")
    hashed_password: str
    created_at: datetime = Field(default_factory=timezone.utc)
    updated_at: datetime = Field(default_factory=timezone.utc)


from app.db.users import User
