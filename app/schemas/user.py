from pydantic import BaseModel, Field, field_validator
import re
from app.models.user import UserRole
from typing import Optional
from app.utils.validators import (
    validate_required_string,
    validate_optional_string,
    validate_regex,
    validate_optional_regex,
)

PASSWORD_REGEX = r"^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?\":{}|<>])[^\s]{6,}$"
PASSWORD_ERROR = "Password must include at least 1 uppercase letter and 1 special character and not contain spaces"
USERNAME_REGEX = r"^[A-Za-z0-9_.-]+$"
USERNAME_ERROR = "Username may contain letters, numbers, underscore, dot, or hyphen"

# Base class
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=25)
    role: UserRole

# Class to create a user
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

    @field_validator("username", mode="before")
    def _validate_username(cls, value):
        validate_required_string(value, "Username")
        return validate_regex(value, USERNAME_REGEX, "Username", USERNAME_ERROR)

    @field_validator("password", mode="before")
    def _validate_password(cls, value):
        validate_required_string(value, "Password")
        # reuse regex helper to validate structure
        return validate_regex(value, PASSWORD_REGEX, "Password", PASSWORD_ERROR)


# Class to update a user
class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=25)
    password: Optional[str] = Field(None, min_length=6)
    role: Optional[UserRole] = None

    @field_validator("username", mode="before")
    def _validate_username_optional(cls, value):
        if value is None:
            return value
        validate_optional_string(value, "Username")
        return validate_optional_regex(value, USERNAME_REGEX, "Username", USERNAME_ERROR)

    @field_validator("password", mode="before")
    def _validate_password_optional(cls, value):
        if value is None:
            return value
        validate_optional_string(value, "Password")
        return validate_optional_regex(value, PASSWORD_REGEX, "Password", PASSWORD_ERROR)


# Class to return info to frontend
class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True