# tests/test_clients.py
import pytest
from app.models.client import Client

NEW_CLIENT = {
    "name": "John Doe",
    "phone_number": "+541112345678",
    "email": "john@example.com"
}

UPDATE_CLIENT = {
    "name": "John Updated",
    "phone_number": "+549112345678",
    "email": "john.updated@example.com"
}

# ------------------------------------------
# CREATE CLIENT
# ------------------------------------------
def test_create_client(override_current_user):
    client = override_current_user
    response = client.post("/clients/", json=NEW_CLIENT)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == NEW_CLIENT["name"]
    assert data["phone_number"] == NEW_CLIENT["phone_number"]
    assert data["email"] == NEW_CLIENT["email"]
    assert "id" in data

# ------------------------------------------
# GET ALL CLIENTS
# ------------------------------------------
def test_list_clients(override_current_user):
    client = override_current_user
    response = client.get("/clients/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(c["name"] == NEW_CLIENT["name"] for c in data)

# ------------------------------------------
# GET CLIENT BY ID
# ------------------------------------------
def test_get_client_by_id(override_current_user, db_session):
    new_client = Client(**NEW_CLIENT)
    db_session.add(new_client)
    db_session.commit()
    db_session.refresh(new_client)

    client = override_current_user
    response = client.get(f"/clients/{new_client.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == new_client.id
    assert data["name"] == NEW_CLIENT["name"]

def test_get_client_by_invalid_id(override_current_user):
    client = override_current_user
    response = client.get("/clients/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Client not found"

# ------------------------------------------
# UPDATE CLIENT
# ------------------------------------------
def test_update_client(override_current_user, db_session):
    new_client = Client(**NEW_CLIENT)
    db_session.add(new_client)
    db_session.commit()
    db_session.refresh(new_client)

    client = override_current_user
    response = client.put(f"/clients/{new_client.id}", json=UPDATE_CLIENT)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == UPDATE_CLIENT["name"]
    assert data["phone_number"] == UPDATE_CLIENT["phone_number"]
    assert data["email"] == UPDATE_CLIENT["email"]

def test_update_client_invalid_id(override_current_user):
    client = override_current_user
    response = client.put("/clients/99999", json=UPDATE_CLIENT)
    assert response.status_code == 404
    assert response.json()["detail"] == "Client not found"

# ------------------------------------------
# DELETE CLIENT (ADMIN ONLY)
# ------------------------------------------
def test_delete_client(override_admin, db_session):
    from app.models.client import Client
    admin_client = override_admin
    new_client = Client(**NEW_CLIENT)
    db_session.add(new_client)
    db_session.commit()
    db_session.refresh(new_client)

    response = admin_client.delete(f"/clients/{new_client.id}")
    assert response.status_code == 204

    from sqlalchemy import select
    client_in_db = db_session.execute(select(Client).filter_by(id=new_client.id)).scalar_one_or_none()
    assert client_in_db is None

def test_delete_client_non_admin(override_employee, db_session):
    from app.models.client import Client
    employee_client = override_employee
    new_client = Client(**NEW_CLIENT)
    db_session.add(new_client)
    db_session.commit()
    db_session.refresh(new_client)

    response = employee_client.delete(f"/clients/{new_client.id}")
    assert response.status_code == 403 or response.status_code == 401
