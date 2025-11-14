from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.models.client import Client as ClientModel
from app.schemas.client import ClientCreate, ClientUpdate, ClientRead
from app.database.database import get_db

router = APIRouter(prefix="/clients", tags=["clients"])

# ============================================
# CLIENT CRUD OPERATIONS
# ============================================


# ------------------------------------------------------------
# CREATE CLIENT
# ------------------------------------------------------------
@router.post("/", response_model=ClientRead, status_code=status.HTTP_201_CREATED)
def create_client(payload: ClientCreate, db: Session = Depends(get_db)):

    new_client = ClientModel(**payload.dict())

    db.add(new_client)

    try:
        db.commit()
        db.refresh(new_client)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Integrity error creating client :(")
    
    return new_client


# ------------------------------------------------------------
# GET ALL CLIENTS
# ------------------------------------------------------------
@router.get("/", response_model=List[ClientRead])
def list_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):

    clients = db.query(ClientModel).offset(skip).limit(limit).all()

    return clients


# ------------------------------------------------------------
# GET CLIENT BY ID
# ------------------------------------------------------------
@router.get("/{client_id}", response_model=ClientRead)
def get_client(client_id: int, db: Session = Depends(get_db)):

    client = db.query(ClientModel).filter(ClientModel.id == client_id).first()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return client


# ------------------------------------------------------------
# UPDATE CLIENT BY ID
# ------------------------------------------------------------
@router.put("/{client_id}", response_model=ClientRead)
def update_client(client_id: int, payload: ClientUpdate, db: Session = Depends(get_db)):

    client = db.query(ClientModel).filter(ClientModel.id == client_id).first()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(client, key, value)

    try:
        db.commit()
        db.refresh(client)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=404, detail="Integrity error updating client :(")

    return client

# ------------------------------------------------------------
# DELETE CLIENT BY ID
# ------------------------------------------------------------
@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: int, db: Session = Depends(get_db)):

    client = db.query(ClientModel).filter(ClientModel.id == client_id).first()

    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.delete(client)
    db.commit()

    return {"message": "Client deleted"}