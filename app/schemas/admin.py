from pydantic import BaseModel, Field


class ChangePassword(BaseModel):
    new_password: str = Field(
        min_length=8, max_length=40, description="New password for the user."
    )
