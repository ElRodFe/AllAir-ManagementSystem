from pydantic import BaseModel, Field, EmailStr
from typing import Optional

# Class to create a client
class ClientCreate(BaseModel):
    name: str = Field(..., max_length=50)
    phone_number: str = Field(..., max_length=20)
    email: Optional[EmailStr] = None

# Schema to update (all optional)
class ClientUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=50)
    phone_number: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None

# Schema to convert SQL to Pydantic
class ClientRead(ClientCreate):
    id: int
    class Config:
        orm_mode = True