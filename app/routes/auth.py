"""
Authentication routes for login, logout, token refresh, and user info.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.models.user import User as UserModel
from app.schemas.auth import LoginRequest, LoginResponse, RefreshTokenRequest, Token, UserInfo
from app.database.database import get_db
from app.utils.auth import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

# ------------------------------------------------------------
# LOGIN
# ------------------------------------------------------------
@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT tokens.
    
    Args:
        login_data: Username and password
        db: Database session
        
    Returns:
        User information with access and refresh tokens
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Find user by username
    user = db.query(UserModel).filter(UserModel.username == login_data.username).first()
    
    # Verify user exists and password is correct
    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token with user info
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    # Create refresh token
    refresh_token = create_refresh_token(
        data={"sub": user.username}
    )
    
    # Return user info and tokens
    return LoginResponse(
        user=UserInfo(
            id=user.id,
            username=user.username,
            role=user.role
        ),
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer"
    )


# ------------------------------------------------------------
# REFRESH TOKEN
# ------------------------------------------------------------
@router.post("/refresh", response_model=Token)
def refresh_token(refresh_data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Generate new access token using refresh token.
    
    Args:
        refresh_data: Refresh token
        db: Database session
        
    Returns:
        New access and refresh tokens
        
    Raises:
        HTTPException: If refresh token is invalid
    """
    try:
        # Decode and validate refresh token
        payload = decode_token(refresh_data.refresh_token)
        username: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        # Verify it's a refresh token
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Verify user still exists
        user = db.query(UserModel).filter(UserModel.username == username).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Create new tokens
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = create_access_token(
            data={"sub": user.username, "role": user.role.value},
            expires_delta=access_token_expires
        )
        
        new_refresh_token = create_refresh_token(
            data={"sub": user.username}
        )
        
        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


# ------------------------------------------------------------
# GET CURRENT USER INFO
# ------------------------------------------------------------
@router.get("/me", response_model=UserInfo)
def get_current_user_info(current_user: UserModel = Depends(get_current_active_user)):
    """
    Get information about the currently authenticated user.
    
    Args:
        current_user: Current authenticated user from token
        
    Returns:
        Current user information
    """
    return UserInfo(
        id=current_user.id,
        username=current_user.username,
        role=current_user.role
    )


# ------------------------------------------------------------
# LOGOUT
# ------------------------------------------------------------
@router.post("/logout")
def logout(current_user: UserModel = Depends(get_current_active_user)):
    """
    Logout endpoint (client-side token removal).
    
    Since JWT is stateless, logout is handled client-side by removing the token.
    This endpoint validates the token and confirms logout.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    return {
        "message": "Successfully logged out",
        "detail": "Please remove the token from client storage"
    }


# ------------------------------------------------------------
# VERIFY TOKEN
# ------------------------------------------------------------
@router.post("/verify")
def verify_token_endpoint(current_user: UserModel = Depends(get_current_active_user)):
    """
    Verify if the current token is valid.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Token validity status and user info
    """
    return {
        "valid": True,
        "user": UserInfo(
            id=current_user.id,
            username=current_user.username,
            role=current_user.role
        )
    }
