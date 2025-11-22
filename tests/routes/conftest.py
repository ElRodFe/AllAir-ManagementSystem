# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.base import Base
from app.main import app
from app.database.database import get_db

# --- DATABASE SETUP ---
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False}, future=True)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        transaction.rollback()
        connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app)
    yield test_client
    app.dependency_overrides.clear()

# --- MOCK AUTH ---
@pytest.fixture()
def fake_admin(db_session):
    from app.models.user import User, UserRole
    from app.utils.auth import hash_password
    admin = User(username="admin", password=hash_password("Admin!1"), role=UserRole.ADMIN)
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin

@pytest.fixture()
def fake_employee(db_session):
    from app.models.user import User, UserRole
    from app.utils.auth import hash_password
    employee = User(username="empleado", password=hash_password("Worker!1"), role=UserRole.EMPLOYEE)
    db_session.add(employee)
    db_session.commit()
    db_session.refresh(employee)
    return employee

@pytest.fixture(scope="function")
def override_current_user(client, db_session):
    from app.models.user import User
    from app.utils.auth import get_current_active_user
    test_user = User(id=999, username="testuser", password="Password1!")
    db_session.add(test_user)
    db_session.commit()
    db_session.refresh(test_user)
    client.app.dependency_overrides[get_current_active_user] = lambda: test_user
    yield client
    client.app.dependency_overrides.pop(get_current_active_user, None)

@pytest.fixture(scope="function")
def override_admin(client, fake_admin):
    from app.utils.auth import require_admin
    client.app.dependency_overrides[require_admin] = lambda: fake_admin
    yield client
    client.app.dependency_overrides.pop(require_admin, None)

@pytest.fixture(scope="function")
def override_employee(client, fake_employee):
    from app.utils.auth import get_current_active_user
    client.app.dependency_overrides[get_current_active_user] = lambda: fake_employee
    yield client
    client.app.dependency_overrides.pop(get_current_active_user, None)
