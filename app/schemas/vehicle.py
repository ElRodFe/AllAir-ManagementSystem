from pydantic import BaseModel, Field

# Base class
class VehicleBase(BaseModel):
    vehicle_type: str
    brand_model: str
    kilometers: int
    plate_number: str
    owner_id: int

# Create a vehicle
class VehicleCreate(VehicleBase):
    pass

# Update a vehicle
class VehicleUpdate(BaseModel):
    vehicle_type: str | None = None
    brand_model: str | None = None
    kilometers: int | None = None
    plate_number: str | None = None
    owner_id: int | None = None

# Return to frontend
class VehicleResponse(VehicleBase):
    id: int

    class Config:
        from_attributes = True