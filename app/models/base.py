"""
Database base configuration.
All SQLAlchemy models inherit from Base.
"""
from sqlalchemy.orm import declarative_base

Base = declarative_base()
