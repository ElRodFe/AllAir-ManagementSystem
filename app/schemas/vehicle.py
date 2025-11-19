from pydantic import BaseModel, Field, field_validator
from typing import Optional
from app.utils.validators import (
    validate_required_string,
    validate_optional_string,
    validate_regex,
    validate_optional_regex,
)

PLATE_REGEX = r"^[A-Z0-9-]+$"
PLATE_ERROR = "Plate number must contain only uppercase letters, numbers, or hyphens (no spaces)"

# Base class
class VehicleBase(BaseModel):
    vehicle_type: str = Field(..., max_length=25)
    brand_model: str = Field(..., max_length=50)
    kilometers: int = Field(..., ge=0)
    plate_number: str = Field(..., max_length=25)
    owner_id: int = Field(..., ge=1)

    @field_validator("vehicle_type", mode="before")
    def _validate_vehicle_type(cls, value):
        return validate_required_string(value, "Vehicle type")

    @field_validator("brand_model", mode="before")
    def _validate_brand_model(cls, value):
        return validate_required_string(value, "Brand/Model")

    @field_validator("plate_number", mode="before")
    def _validate_plate_number(cls, value):
        value = validate_required_string(value, "Plate number").upper()
        return validate_regex(value, PLATE_REGEX, "Plate number", PLATE_ERROR)

# Create a vehicle
class VehicleCreate(VehicleBase):
    pass

# Update a vehicle
class VehicleUpdate(BaseModel):
    vehicle_type: Optional[str] = Field(None, max_length=25)
    brand_model: Optional[str] = Field(None, max_length=50)
    kilometers: Optional[int] = Field(None, ge=0)
    plate_number: Optional[str] = Field(None, max_length=25)
    owner_id: Optional[int] = Field(None, ge=1)

    @field_validator("vehicle_type", mode="before")
    def _validate_vehicle_type_opt(cls, value):
        if value is None:
            return value
        return validate_optional_string(value, "Vehicle type")

    @field_validator("brand_model", mode="before")
    def _validate_brand_model_opt(cls, value):
        if value is None:
            return value
        return validate_optional_string(value, "Brand/Model")

    @field_validator("plate_number", mode="before")
    def _validate_plate_number_opt(cls, value):
        if value is None:
            return value
        value = validate_optional_string(value, "Plate number").upper()
        return validate_optional_regex(value, PLATE_REGEX, "Plate number", PLATE_ERROR)


# Return to frontend
class VehicleResponse(VehicleBase):
    id: int

    class Config:
        from_attributes = True