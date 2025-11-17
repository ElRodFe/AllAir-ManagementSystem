from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.models.user import User as UserModel
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.database.database import get_db

router = APIRouter(prefix="/user", tags=["User"])

# ============================================
# USER CRUD OPERATIONS
# ============================================

# ------------------------------------------------------------
# CREATE USER
# ------------------------------------------------------------
@router.post("/", response_model=UserResponse)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):

    existing = db.query(UserModel).filter(UserModel.username == user_data.username).first()

    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = UserModel(
        username = user_data.username,
        password = user_data.password,
        role = user_data.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ------------------------------------------------------------
# GET ALL USERS
# ------------------------------------------------------------
@router.get("/", response_model=List[UserResponse])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):

    users = db.query(UserModel).offset(skip).limit(limit).all()
    return users


# ------------------------------------------------------------
# GET SINGLE USER BY ID
# ------------------------------------------------------------
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


# ------------------------------------------------------------
# UPDATE USER BY ID
# ------------------------------------------------------------
@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, updates: UserUpdate, db: Session = Depends(get_db)):

    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    data = updates.dict(exclude_unser = True)
    
    for key, value in data.items():
        setattr(user, key, value)

    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=404, detail="Integrity error updating user :(")

    return user


# ------------------------------------------------------------
# DELETE VEHICLES BY ID
# ------------------------------------------------------------
@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(UserModel).filter(UserModel.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()

    return {"message": "User deleted"}