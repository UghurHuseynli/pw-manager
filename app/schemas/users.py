from pydantic import BaseModel, EmailStr, Field


class PasswordResetRequest(BaseModel):
    """Schema for password reset request."""

    email: EmailStr = Field(
        ..., description="Email address of the user requesting password reset."
    )


class PasswordResetConfirm(BaseModel):
    """Schema for confirming password reset."""

    token: str = Field(..., description="Token for password reset confirmation.")
    new_password: str = Field(
        ..., min_length=8, max_length=40, description="New password for the user."
    )
