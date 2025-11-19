from fastapi import FastAPI
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

from app.routes import auth_router, clients_router, user_router, vehicle_router, work_order_router

# Load environment variables
load_dotenv()

DB_URL = os.getenv("DB_URL")

# SQLAlchemy setup
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(autocommit = False, autoflush= False, bind=engine)

# Starting the APP
app = FastAPI()

# Router functionalities
app.include_router(auth_router)
app.include_router(clients_router)
app.include_router(user_router)
app.include_router(vehicle_router)
app.include_router(work_order_router)

@app.get("/test-db")
def test_db():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return {"db_status": "connected", "result": [row[0] for row in result]}
    except Exception as e:
          return {"db_status": "error", "error": str(e)}
