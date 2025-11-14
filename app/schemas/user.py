from pydantic import BaseModel, Field
from app.models.user import UserRole

# Base class
class UserBase(BaseModel):
    username: str
    role: UserRole

# Class to create a user
class UserCreate(UserBase):
    password: str

# Class to update a user
class UserUpdate(BaseModel):
    username: str | None = None
    password: str | None = None
    role: UserRole | None = None

# Class to return info to frontend
class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True