from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.work_order import WorkStatus, PaymentStatus

class WorkOrderBase(BaseModel):
    entry_date: date
    egress_date: Optional[date] = None

    client_id: int
    vehicle_id: int

    work_status: WorkStatus = WorkStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.NOT_PAID

    refrigerant_gas_retrieved: Optional[int] = None
    refrigerant_gas_injected: Optional[int] = None
    oil_retrieved: Optional[int] = None
    oil_injected: Optional[int] = None
    
    detector: Optional[bool] = None
    spare_parts: Optional[str] = None
    details: Optional[str] = None

    workers: str
    hours: Optional[int] = None

class WorkOrderCreate(WorkOrderBase):
    pass

class WorkOrderUpdate(BaseModel):
    entry_date: Optional[date] = None
    egress_date: Optional[date] = None
    
    client_id: Optional[int] = None
    vehicle_id: Optional[int] = None
    
    work_status: Optional[WorkStatus] = None
    payment_status: Optional[PaymentStatus] = None

    refrigerant_gas_retrieved: Optional[int] = None
    refrigerant_gas_injected: Optional[int] = None
    oil_retrieved: Optional[int] = None
    oil_injected: Optional[int] = None
    
    detector: Optional[bool] = None
    spare_parts: Optional[str] = None
    details: Optional[str] = None

    workers: Optional[str] = None
    hours: Optional[int] = None

class WorkOrderResponse(WorkOrderBase):
    id: int

    class Config:
        from_attributes = True
