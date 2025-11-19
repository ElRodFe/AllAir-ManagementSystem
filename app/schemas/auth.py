"""
Authentication schemas for login, token management, and user responses.
"""
from pydantic import BaseModel
from app.models.user import UserRole


# ============================================
# LOGIN SCHEMAS
# ============================================
class LoginRequest(BaseModel):
    """Schema for user login request"""
    username: str
    password: str


class Token(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema for token payload data"""
    username: str | None = None


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request"""
    refresh_token: str


# ============================================
# USER INFO SCHEMAS
# ============================================
class UserInfo(BaseModel):
    """Schema for authenticated user information"""
    id: int
    username: str
    role: UserRole
    
    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    """Schema for complete login response with user info and tokens"""
    user: UserInfo
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
