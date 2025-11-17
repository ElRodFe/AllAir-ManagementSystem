"""
Work Order model for tracking vehicle service and repair jobs.
Includes work status, payment tracking, and service details.
"""
from sqlalchemy import Column, Integer, String, Date, Boolean, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.models.base import Base


# Define WorkStatus enum matching your PostgreSQL enum
class WorkStatus(str, enum.Enum):
    """Work order status enumeration"""
    PENDING = "pending"
    COMPLETED = "completed"


# Define PaymentStatus enum matching your PostgreSQL enum
class PaymentStatus(str, enum.Enum):
    """Payment status enumeration"""
    NOT_PAID = "NOT_PAID"
    PAID = "PAID"
    BILL_SENT = "BILL_SENT"
    NOT_REQUESTED = "NOT_REQUESTED"


class WorkOrder(Base):
    __tablename__ = "work_orders"
    
    # Primary Key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Dates
    entry_date = Column(Date, nullable=False)
    egress_date = Column(Date, nullable=True)
    
    # Foreign Keys
    client_id = Column(
        Integer,
        ForeignKey('Clients.id', ondelete='CASCADE'),
        nullable=False
    )
    vehicle_id = Column(
        Integer,
        ForeignKey('Vehicles.id', ondelete='CASCADE'),
        nullable=False
    )
    
    # Status Fields
    work_status = Column(
        Enum(WorkStatus, name="work_status"),
        nullable=False,
        default=WorkStatus.PENDING
    )
    payment_status = Column(
        Enum(PaymentStatus, name="payment_status"),
        nullable=False,
        default=PaymentStatus.NOT_PAID
    )
    
    # Service Details - Refrigerant and Oil
    refrigerant_gas_retrieved = Column(Integer, nullable=True)
    refrigerant_gas_injected = Column(Integer, nullable=True)
    oil_retrieved = Column(Integer, nullable=True)
    oil_injected = Column(Integer, nullable=True)
    
    # Equipment and Parts
    detector = Column(Boolean, nullable=True)
    spare_parts = Column(Text, nullable=True)
    details = Column(Text, nullable=True)
    
    # Work Information
    workers = Column(String(50), nullable=False)
    hours = Column(Integer, nullable=True)
    
    # Relationships
    client = relationship("Client", back_populates="work_orders")
    vehicle = relationship("Vehicle", back_populates="work_orders")
    
    def __repr__(self):
        """String representation of WorkOrder"""
        return f"<WorkOrder(id={self.id}, client_id={self.client_id}, vehicle_id={self.vehicle_id}, status='{self.work_status.value}')>"
