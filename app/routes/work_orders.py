from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from pydantic import BaseModel
from app.database.database import get_db
from app.models.work_order import WorkOrder as WorkOrderModel
from app.models.client import Client as ClientModel
from app.models.vehicle import Vehicle as VehicleModel
from app.schemas.work_order import (
    WorkOrderCreate,
    WorkOrderUpdate,
    WorkOrderResponse
)

router = APIRouter(
    prefix="/work-orders",
    tags=["Work Orders"]
)

class MessageResponse(BaseModel):
    message: str

# ============================================
# WORK ORDERS CRUD OPERATIONS
# ============================================


# ------------------------------------------------------------
# CREATE WORK ORDER
# ------------------------------------------------------------
@router.post("/", response_model=WorkOrderResponse, status_code=status.HTTP_201_CREATED)
def create_work_order(data: WorkOrderCreate, db: Session = Depends(get_db)):
    client = db.query(ClientModel).filter(ClientModel.id == data.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    vehicle = db.query(VehicleModel).filter(VehicleModel.id == data.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    if vehicle.owner_id != client.id:
        raise HTTPException(status_code=400, detail="Vehicle does not belong to the specified client")
    
    new_work_order = WorkOrderModel(**data.dict())

    db.add(new_work_order)

    try:
        db.commit()
        db.refresh(new_work_order)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Integrity error creating work order :(")

    return new_work_order


# ------------------------------------------------------------
# GET ALL WORK ORDERS
# ------------------------------------------------------------
@router.get("/", response_model=List[WorkOrderResponse])
def list_work_orders(skip: int = 0, limit: int = 0, db: Session = Depends(get_db)):

    work_orders = db.query(WorkOrderModel).offset(skip).limit(limit).all()
    return work_orders


# ------------------------------------------------------------
# GET SINGLE WORK ORDER BY ID
# ------------------------------------------------------------
@router.get("/{work_order_id}", response_model=WorkOrderResponse)
def get_work_order(work_order_id: int, db: Session = Depends(get_db)):

    work_order = db.query(WorkOrderModel).filter(WorkOrderModel.id == work_order_id).first()

    if not work_order:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    return work_order


# ------------------------------------------------------------
# UPDATE WORK ORDER BY ID
# ------------------------------------------------------------
@router.put("/{work_order_id}", response_model=WorkOrderResponse)
def update_work_order(work_order_id: int, data: WorkOrderUpdate, db: Session = Depends(get_db)):

    work_order = db.query(WorkOrderModel).filter(WorkOrderModel.id == work_order_id).first()

    if not work_order:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    update_data = data.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(work_order, key, value)

    db.commit()
    db.refresh(work_order)

    return work_order


# ------------------------------------------------------------
# DELETE WORK ORDER BY ID
# ------------------------------------------------------------
@router.delete("/{work_order_id}", response_model=MessageResponse)
def delete_work_order(work_order_id: int, db: Session = Depends(get_db)):
    work_order = db.query(WorkOrderModel).filter(WorkOrderModel.id == work_order_id).first()
    if not work_order:
        raise HTTPException(status_code=404, detail="Work order not found")
    
    db.delete(work_order)
    db.commit()
    
    return {"message": "Work order deleted"}
    