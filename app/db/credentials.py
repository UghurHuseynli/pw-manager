from sqlmodel import SQLModel, Field
from datetime import datetime, timezone


class Credentials(SQLModel, table=True):
    id: int = Field(primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    service_name: str
    url: str | None
    username: str
    password: str = Field(max_length=255)
    notes: str | None = Field(max_length=1000)
    created_at: datetime = Field(default_factory=timezone.utc)
    updated_at: datetime = Field(
        default_factory=timezone.utc, sa_column_kwargs={"onupdate": timezone.utc}
    )
