"""
User model for authentication and authorization.
Includes role-based access control (admin/employee).
"""
from sqlalchemy import Column, Integer, String, Enum
import enum
from app.models.base import Base


# Define the UserRole enum matching your PostgreSQL enum
class UserRole(str, enum.Enum):
    """User role enumeration for access control"""
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"


class User(Base):

    __tablename__ = "Users"
    
    # Primary Key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # User credentials
    username = Column(String(25), nullable=False, unique=True)
    password = Column(String(255), nullable=False)
    
    # Role with default value
    role = Column(
        Enum(UserRole, name="user_role"),
        nullable=False,
        default=UserRole.EMPLOYEE
    )
    
    def __repr__(self):
        """String representation of User"""
        return f"<User(id={self.id}, username='{self.username}', role='{self.role.value}')>"
