from pydantic import BaseModel, Field, field_validator, EmailStr
from typing import Optional
from app.utils.validators import (
    validate_required_string,
    validate_optional_string,
    validate_regex,
    validate_optional_regex,
)

PHONE_REGEX = r"[0-9+\-\s]+"
PHONE_ERROR = "Phone number contains invalid characters"

# Class to create a client
class ClientCreate(BaseModel):
    name: str = Field(..., max_length=50)
    phone_number: str = Field(..., max_length=20)
    email: Optional[EmailStr] = Field(None, max_length=50)

    @field_validator("name", mode="before")
    def _validate_name(cls, value):
        return validate_required_string(value, "Name")

    @field_validator("phone_number", mode="before")
    def _validate_phone(cls, value):
        # required string + regex
        validate_required_string(value, "Phone number")
        return validate_regex(value, PHONE_REGEX, "Phone number", PHONE_ERROR)

# Schema to update (all optional)
class ClientUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = Field(None, max_length=50)

    @field_validator("name", mode="before")
    def _validate_name_optional(cls, value):
        if value is None:
            return value
        return validate_optional_string(value, "Name")

    @field_validator("phone_number", mode="before")
    def _validate_phone_optional(cls, value):
        if value is None:
            return value
        validate_optional_string(value, "Phone number")
        return validate_optional_regex(value, PHONE_REGEX, "Phone number", PHONE_ERROR)
    
# Schema to convert SQL to Pydantic
class ClientRead(ClientCreate):
    id: int
    class Config:
        orm_mode = True