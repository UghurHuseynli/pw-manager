from pydantic import BaseModel


class Password(BaseModel):
    """Schema for return password."""

    password: str
