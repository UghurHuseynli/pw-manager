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


class Message(BaseModel):
    message: str


class Token(BaseModel):
    """Schema for token response."""

    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Schema for token payload."""

    sub: str
    exp: int


class NewPassword(BaseModel):
    """Schema for new password."""

    token: str
    new_password: str = Field(
        min_length=8, max_length=40, description="New password for the user."
    )
