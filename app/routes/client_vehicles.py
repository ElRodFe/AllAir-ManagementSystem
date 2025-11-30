from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.client import Client
from app.models.vehicle import Vehicle as VehicleModel
from app.schemas.vehicle import VehicleCreate, VehicleResponse

router = APIRouter(
    prefix="/clients",
    tags=["Clients - Vehicles"]
)

@router.get("/{client_id}/vehicles", response_model=list[VehicleResponse])
def get_vehicles_by_client(client_id: int, db: Session = Depends(get_db)):

    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    return db.query(VehicleModel).filter(VehicleModel.owner_id == client_id).all()


@router.post("/{client_id}/vehicles", response_model=VehicleResponse)
def create_vehicle_for_client(client_id: int, vehicle: VehicleCreate, db: Session = Depends(get_db)):
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    new_vehicle = VehicleModel(
        owner_id=client_id,
        vehicle_type=vehicle.vehicle_type,
        brand_model=vehicle.brand_model,
        kilometers=vehicle.kilometers,
        plate_number=vehicle.plate_number.upper(),
    )

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return new_vehicle

@router.delete("/{client_id}/vehicles/{vehicle_id}")
def delete_vehicle_for_client(client_id: int, vehicle_id: int, db: Session = Depends(get_db)):

    vehicle = (
        db.query(VehicleModel)
        .filter(
            VehicleModel.id == vehicle_id,
            VehicleModel.owner_id == client_id
        )
        .first()
    )

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    db.delete(vehicle)
    db.commit()

    return {"message": "Vehicle deleted"}