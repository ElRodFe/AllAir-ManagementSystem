from app.models.base import Base
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship


class Client(Base):
    __tablename__ = 'clients'

    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)

    # Client Information
    name = Column(String(50),nullable=False)
    phone_number = Column(String(20), nullable=False)
    email = Column(String(50), nullable=True)

    # Relationships
    vehicles = relationship("Vehicle", back_populates="owner", cascade="all, delete-orphan")
    work_orders = relationship("WorkOrder", back_populates="client", cascade="all, delete-orphan")

    def __repr__(self):
        """String representation of Clients"""
        return f"<Client(id='{self.id}', name='{self.name}', phone='{self.phone_number}', email='{self.email}')>"
