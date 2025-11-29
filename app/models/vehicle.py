"""
Vehicle model for tracking client vehicles.
Each vehicle belongs to a client (owner).
"""
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class Vehicle(Base):
    
    __tablename__ = "vehicles"
    
    # Primary Key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Vehicle Information
    vehicle_type = Column(String(25), nullable=False)
    brand_model = Column(String(50), nullable=False)
    kilometers = Column(Integer, nullable=False)
    plate_number = Column(String(25), nullable=False, unique=True, index=True)
    
    # Foreign Key to Client
    owner_id = Column(
        Integer,
        ForeignKey('clients.id', ondelete='CASCADE'),
        nullable=False
    )
    
    # Relationships
    owner = relationship("Client", back_populates="vehicles")
    work_orders = relationship("WorkOrder", back_populates="vehicle", cascade="all, delete-orphan")
    
    def __repr__(self):
        """String representation of Vehicle"""
        return f"<Vehicle(id={self.id}, plate='{self.plate_number}', model='{self.brand_model}', owner_id={self.owner_id})>"
