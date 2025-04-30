from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


class User(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    username: str = Field(unique=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password: str = Field(max_length=255)
    is_active: bool = Field(default=False)
    is_superuser: bool = Field(default=False)
    created_at: datetime = Field(default_factory=timezone.utc)
    updated_at: datetime = Field(
        default_factory=timezone.utc, sa_column_kwargs={"onupdate": timezone.utc}
    )
