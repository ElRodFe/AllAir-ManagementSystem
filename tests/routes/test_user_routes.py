import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.utils.auth import hash_password, require_admin, get_current_active_user

# -----------------------------
# FIXTURES: MOCK USERS
# -----------------------------
@pytest.fixture()
def fake_admin():
    """Fake admin user for testing admin-protected routes"""
    return User(
        id=1,
        username="admin",
        password=hash_password("Admin!1"),
        role=UserRole.ADMIN
    )

@pytest.fixture()
def fake_employee():
    """Fake employee user for testing authenticated routes"""
    return User(
        id=2,
        username="employee",
        password=hash_password("Worker!1"),
        role=UserRole.EMPLOYEE
    )

# -----------------------------
# TEST: CREATE USER (ADMIN ONLY)
# -----------------------------
def test_create_user(client: TestClient, db_session: Session, fake_admin):
    client.app.dependency_overrides[require_admin] = lambda: fake_admin

    payload = {
        "username": "new_user",
        "password": "Pass123!",
        "role": UserRole.EMPLOYEE
    }

    response = client.post("/user/", json=payload)
    print(response.status_code)
    print(response.json())

    assert response.status_code == 200
    assert response.json()["username"] == "new_user"
    assert response.json()["role"] == "EMPLOYEE"

    client.app.dependency_overrides.clear()

# -----------------------------
# TEST: CREATE USER WITH DUPLICATE USERNAME
# -----------------------------
def test_create_user_duplicate_username(client: TestClient, db_session: Session, fake_admin):
    client.app.dependency_overrides[require_admin] = lambda: fake_admin

    db_session.add(User(
        username="duplicate",
        password=hash_password("Password!1"),
        role=UserRole.EMPLOYEE
    ))
    db_session.commit()

    payload = {
        "username": "duplicate",
        "password": "Password!1",
        "role": UserRole.EMPLOYEE
    }

    response = client.post("/user/", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "Username already exists"

    client.app.dependency_overrides.clear()

# -----------------------------
# TEST: LIST USERS (ADMIN ONLY)
# -----------------------------
def test_list_users(client: TestClient, db_session: Session, fake_admin):
    client.app.dependency_overrides[require_admin] = lambda: fake_admin

    db_session.add_all([
        User(username="user_a", password=hash_password("a"), role=UserRole.EMPLOYEE),
        User(username="user_b", password=hash_password("b"), role=UserRole.EMPLOYEE)
    ])
    db_session.commit()

    response = client.get("/user/")

    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2

    client.app.dependency_overrides.clear()

# -----------------------------
# TEST: GET USER BY ID (AUTHENTICATED)
# -----------------------------
def test_get_user(client: TestClient, db_session: Session, fake_employee):
    client.app.dependency_overrides[get_current_active_user] = lambda: fake_employee

    user = User(username="persona", password=hash_password("pass"), role=UserRole.EMPLOYEE)
    db_session.add(user)
    db_session.commit()

    response = client.get(f"/user/{user.id}")

    assert response.status_code == 200
    assert response.json()["username"] == "persona"

    client.app.dependency_overrides.clear()

# -----------------------------
# TEST: UPDATE USER (ADMIN ONLY)
# -----------------------------
def test_update_user(client: TestClient, db_session: Session, fake_admin):
    client.app.dependency_overrides[require_admin] = lambda: fake_admin

    user = User(username="old_name", password=hash_password("pass"), role=UserRole.EMPLOYEE)
    db_session.add(user)
    db_session.commit()

    payload = {"username": "new_name"}
    response = client.put(f"/user/{user.id}", json=payload)

    assert response.status_code == 200
    assert response.json()["username"] == "new_name"

    client.app.dependency_overrides.clear()

# -----------------------------
# TEST: DELETE USER (ADMIN ONLY)
# -----------------------------
def test_delete_user(client: TestClient, db_session: Session, fake_admin):
    client.app.dependency_overrides[require_admin] = lambda: fake_admin

    user = User(username="to_delete", password=hash_password("pass"), role=UserRole.EMPLOYEE)
    db_session.add(user)
    db_session.commit()

    response = client.delete(f"/user/{user.id}")

    assert response.status_code == 200
    assert response.json()["message"] == "User deleted"

    remaining = db_session.query(User).filter_by(id=user.id).first()
    assert remaining is None

    client.app.dependency_overrides.clear()
