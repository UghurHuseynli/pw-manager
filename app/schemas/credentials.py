from pydantic import BaseModel, Field


class Password(BaseModel):
    """Schema for return password."""

    password: str
