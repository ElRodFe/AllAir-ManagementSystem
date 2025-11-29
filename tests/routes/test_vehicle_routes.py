import json
import uuid
import pytest
from app.models.client import Client


# ---------- Sample data ----------
NEW_VEHICLE_PAYLOAD = {
    "vehicle_type": "Car",
    "brand_model": "Toyota Corolla",
    "kilometers": 12000,
    "plate_number": "CCC-222"
}

NEW_VEHICLE_PAYLOAD_2 = {
    "vehicle_type": "Truck",
    "brand_model": "Ford F150",
    "kilometers": 50000,
    "plate_number": "XYZ-987"
}

OWNER_DATA = {
    "name": "Test Owner",
    "phone_number": "123456789",
    "email": "test@test.com"
}


# ---------- Fixture to create a real owner ----------
@pytest.fixture(scope="function")
def owner(db_session):
    owner = Client(**OWNER_DATA)
    db_session.add(owner)
    db_session.commit()
    db_session.refresh(owner)
    return owner


# ---------- Create a vehicle ----------
def test_create_vehicle(client, owner):
    payload = {**NEW_VEHICLE_PAYLOAD, "owner_id": owner.id, "plate_number": f"CCC-{uuid.uuid4().hex[:4].upper()}"}

    resp = client.post("/vehicles/", json=payload)

    assert resp.status_code in (200, 201)
    data = resp.json()

    assert "id" in data
    assert data["vehicle_type"] == payload["vehicle_type"]
    assert data["brand_model"] == payload["brand_model"]
    assert data["kilometers"] == payload["kilometers"]
    assert data["plate_number"] == payload["plate_number"].upper()


# ---------- Listing vehicles ----------
def test_listing_vehicles(client, owner):
    payload = {**NEW_VEHICLE_PAYLOAD, "owner_id": owner.id, "plate_number": f"CCC-{uuid.uuid4().hex[:4].upper()}"}
    client.post("/vehicles/", json=payload)

    resp = client.get("/vehicles/")
    assert resp.status_code == 200
    data = resp.json()

    assert isinstance(data, list)
    assert len(data) >= 1


# ---------- Obtain one vehicle ----------
def test_get_vehicle_by_id(client, owner):
    payload = {**NEW_VEHICLE_PAYLOAD, "owner_id": owner.id, "plate_number": f"CCC-{uuid.uuid4().hex[:4].upper()}"}
    create_resp = client.post("/vehicles/", json=payload)

    created = create_resp.json()
    vid = created["id"]

    resp = client.get(f"/vehicles/{vid}")
    assert resp.status_code == 200
    data = resp.json()

    assert data["id"] == vid
    assert data["brand_model"] == payload["brand_model"]


# ---------- Update one vehicle ----------
def test_update_vehicle(client, owner):
    payload = {**NEW_VEHICLE_PAYLOAD, "owner_id": owner.id, "plate_number": f"CCC-{uuid.uuid4().hex[:4].upper()}"}
    create_resp = client.post("/vehicles/", json=payload)

    vid = create_resp.json()["id"]

    update_payload = {
        "brand_model": "Toyota Corolla Updated",
        "kilometers": 13000
    }

    resp = client.put(f"/vehicles/{vid}", json=update_payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["brand_model"] == update_payload["brand_model"]
    assert data["kilometers"] == update_payload["kilometers"]


# ---------- Delete one vehicle ----------
def test_delete_vehicle(client, owner):
    payload = {**NEW_VEHICLE_PAYLOAD, "owner_id": owner.id, "plate_number": f"CCC-{uuid.uuid4().hex[:4].upper()}"}
    create_resp = client.post("/vehicles/", json=payload)
    vid = create_resp.json()["id"]

    del_resp = client.delete(f"/vehicles/{vid}")
    assert del_resp.status_code in (200, 204)

    get_resp = client.get(f"/vehicles/{vid}")
    assert get_resp.status_code in (404, 200)

    if get_resp.status_code == 200:
        data = get_resp.json()
        assert data is None or data == {} or data.get("id") != vid


# ---------- Errors ----------
def test_create_vehicle_invalid_payload(client, owner):
    bad = {**NEW_VEHICLE_PAYLOAD, "owner_id": owner.id}
    bad["kilometers"] = -10

    resp = client.post("/vehicles/", json=bad)
    assert resp.status_code in (422, 400)


def test_create_vehicle_missing_required(client, owner):
    bad = {"brand_model": "No type", "owner_id": owner.id}

    resp = client.post("/vehicles/", json=bad)
    assert resp.status_code == 422


def test_update_vehicle_invalid_plate(client, owner):
    payload = {**NEW_VEHICLE_PAYLOAD, "owner_id": owner.id, "plate_number": f"CCC-{uuid.uuid4().hex[:4].upper()}"}
    create_resp = client.post("/vehicles/", json=payload)
    vid = create_resp.json()["id"]

    bad_update = {"plate_number": "bad plate"}

    resp = client.put(f"/vehicles/{vid}", json=bad_update)
    assert resp.status_code in (422, 400)
