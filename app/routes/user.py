from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.database.database import get_db
from app.utils.auth import hash_password, require_admin, get_current_active_user

router = APIRouter(prefix="/user", tags=["User"])

# ============================================
# USER CRUD OPERATIONS
# ============================================

# ------------------------------------------------------------
# CREATE USER (ADMIN ONLY)
# ------------------------------------------------------------
@router.post("/", response_model=UserResponse)
def create_user(
    user_data: UserCreate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin)
):
    """Create a new user. Requires ADMIN role."""
    existing = db.query(UserModel).filter(UserModel.username == user_data.username).first()

    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Hash the password before storing
    new_user = UserModel(
        username = user_data.username,
        password = hash_password(user_data.password),
        role = user_data.role
    )

    db.add(new_user)
    
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Integrity error creating user :(")

    return new_user


# ------------------------------------------------------------
# GET ALL USERS (ADMIN ONLY)
# ------------------------------------------------------------
@router.get("/", response_model=List[UserResponse])
def list_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin)
):
    """Get all users. Requires ADMIN role."""
    users = db.query(UserModel).offset(skip).limit(limit).all()
    return users


# ------------------------------------------------------------
# GET SINGLE USER BY ID (AUTHENTICATED)
# ------------------------------------------------------------
@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_user)
):
    """Get user by ID. Requires authentication."""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


# ------------------------------------------------------------
# UPDATE USER BY ID (ADMIN ONLY)
# ------------------------------------------------------------
@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int, 
    updates: UserUpdate, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin)
):
    """Update user by ID. Requires ADMIN role."""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    data = updates.dict(exclude_unset = True)
    
    # Hash password if it's being updated
    if 'password' in data and data['password'] is not None:
        data['password'] = hash_password(data['password'])
    
    for key, value in data.items():
        setattr(user, key, value)

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Integrity error updating user")

    return user


# ------------------------------------------------------------
# DELETE USER BY ID (ADMIN ONLY)
# ------------------------------------------------------------
@router.delete("/{user_id}")
def delete_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin)
):
    """Delete user by ID. Requires ADMIN role."""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()

    return {"message": "User deleted"}
