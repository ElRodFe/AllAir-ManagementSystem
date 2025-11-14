from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from app.models.base import Base
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv("DB_URL", "sqlite:///./test.db")

# Connection to DB
engine = create_engine(DB_URL, future=True)

# Creates local sessions
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

# Creates the session and ends it
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()