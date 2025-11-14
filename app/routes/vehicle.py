from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.models.vehicle import Vehicle as VehicleModel
from app.models.client import Client
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.database.database import get_db

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

# ============================================
# VEHICLE CRUD OPERATIONS
# ============================================


# ------------------------------------------------------------
# CREATE VEHICLE
# ------------------------------------------------------------
@router.post("/", response_model=VehicleResponse)
def create_vehicle(vehicle_data: VehicleCreate, db: Session = Depends(get_db)):

    owner = db.query(Client).filter(Client.id == vehicle_data.owner_id).first()

    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    
    new_vehicle = VehicleModel(**vehicle_data.dict())

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return new_vehicle


# ------------------------------------------------------------
# GET ALL VEHICLES
# ------------------------------------------------------------
@router.get("/", response_model=List[VehicleResponse])
def list_vehicles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):

    vehicles = db.query(VehicleModel).offset(skip).limit(limit).all()
    return vehicles


# ------------------------------------------------------------
# GET SINGLE VEHICLE BY ID
# ------------------------------------------------------------
@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):

    vehicle = db.query(VehicleModel).filter(VehicleModel.id == vehicle_id).first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found :(")
    
    return vehicle


# ------------------------------------------------------------
# UPDATE VEHICLES BY ID
# ------------------------------------------------------------
@router.put("/{vehicle_id}", response_model=VehicleResponse)
def update_vehicle(vehicle_id: int, updates: VehicleUpdate, db: Session = Depends(get_db)):

    vehicle = db.query(VehicleModel).filter(VehicleModel.id == vehicle_id).first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    update_data = updates.dict(exclude_unset=True)

    if "owner_id" in update_data:
        owner = db.query(Client).filter(Client.id == update_data["owner_id"]).first()

        if not owner:
            raise HTTPException(status_code=404, detail="Owner not found")
        
    for key, value in update_data.items():
        setattr(vehicle, key, value)

    db.commit()
    db.refresh(vehicle)

    return vehicle


# ------------------------------------------------------------
# DELETE VEHICLES BY ID
# ------------------------------------------------------------
@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):

    vehicle = db.query(VehicleModel).filter(VehicleModel.id == vehicle_id).first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db.delete(vehicle)
    db.commit()

    return {"message": "Vehicle deleted"}