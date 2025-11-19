from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import date
from app.models.work_order import WorkStatus, PaymentStatus
from app.utils.validators import (
    validate_required_string,
    validate_optional_string,
    validate_egress_not_before_entry,
)

class WorkOrderBase(BaseModel):
    entry_date: date
    egress_date: Optional[date] = None

    client_id: int = Field(..., ge=1)
    vehicle_id: int = Field(..., ge=1)

    work_status: WorkStatus = WorkStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.NOT_PAID

    refrigerant_gas_retrieved: Optional[int] = Field(None, ge=0)
    refrigerant_gas_injected: Optional[int] = Field(None, ge=0)
    oil_retrieved: Optional[int] = Field(None, ge=0)
    oil_injected: Optional[int] = Field(None, ge=0)
    
    detector: Optional[bool] = None
    spare_parts: Optional[str] = Field(None, max_length=500)
    details: Optional[str] = Field(None, max_length=1000)

    workers: str = Field(..., max_length=50)
    hours: Optional[int] = Field(None, ge=0)

    @field_validator("workers", mode="before")
    def _validate_workers(cls, value):
        return validate_required_string(value, "Workers")

    @field_validator("spare_parts", "details", mode="before")
    def _validate_text_optional(cls, value, info):
        # info.field_name available to build a friendly field label
        field_label = info.field_name.replace("_", " ").title()
        return validate_optional_string(value, field_label)

    # validate egress_date AFTER entry_date is validated -> use mode="after"
    @field_validator("egress_date", mode="after")
    def _validate_egress(cls, value, info):
        # values in info.data contain already-validated fields
        entry = info.data.get("entry_date")
        return validate_egress_not_before_entry(entry, value)

class WorkOrderCreate(WorkOrderBase):
    pass

class WorkOrderUpdate(BaseModel):
    entry_date: Optional[date] = None
    egress_date: Optional[date] = None
    
    client_id: Optional[int] = Field(None, ge=1)
    vehicle_id: Optional[int] = Field(None, ge=1)
    
    work_status: Optional[WorkStatus] = None
    payment_status: Optional[PaymentStatus] = None

    refrigerant_gas_retrieved: Optional[int] = Field(None, ge=0)
    refrigerant_gas_injected: Optional[int] = Field(None, ge=0)
    oil_retrieved: Optional[int] = Field(None, ge=0)
    oil_injected: Optional[int] = Field(None, ge=0)
    
    detector: Optional[bool] = None
    spare_parts: Optional[str] = Field(None, max_length=500)
    details: Optional[str] = Field(None, max_length=1000)

    workers: Optional[str] = Field(None, max_length=50)
    hours: Optional[int] = Field(None, ge=0)

    @field_validator("workers", mode="before")
    def _validate_workers_opt(cls, value):
        if value is None:
            return value
        return validate_optional_string(value, "Workers")

    @field_validator("spare_parts", "details", mode="before")
    def _validate_text_optional_fields(cls, value, info):
        if value is None:
            return value
        field_label = info.field_name.replace("_", " ").title()
        return validate_optional_string(value, field_label)

    @field_validator("egress_date", mode="after")
    def _validate_egress_opt(cls, value, info):
        entry = info.data.get("entry_date")
        return validate_egress_not_before_entry(entry, value)

class WorkOrderResponse(WorkOrderBase):
    id: int

    class Config:
        from_attributes = True
