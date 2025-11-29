import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.client import Client
from app.models.vehicle import Vehicle
from app.models.work_order import WorkStatus, PaymentStatus
from datetime import date, timedelta
from uuid import uuid4

# ------------------------
# TEST CLIENT
# ------------------------
@pytest.fixture()
def test_client():
    with TestClient(app) as client:
        yield client

# ------------------------
# DB FIXTURES
# ------------------------
@pytest.fixture()
def client_obj(db_session):
    client = Client(name="Test Client", phone_number="123456789", email="client@test.com")
    db_session.add(client)
    db_session.commit()
    db_session.refresh(client)
    return client

@pytest.fixture()
def vehicle_obj(db_session, client_obj):
    unique_plate = f"TES-{str(uuid4())[:8]}"
    vehicle = Vehicle(
        vehicle_type="Car",
        kilometers=12000,
        plate_number=unique_plate,
        brand_model="Toyota Corolla",
        owner_id=client_obj.id
    )
    db_session.add(vehicle)
    db_session.commit()
    db_session.refresh(vehicle)
    return vehicle

@pytest.fixture()
def work_order_payload(client_obj, vehicle_obj):
    return {
        "entry_date": str(date.today()),
        "egress_date": str(date.today() + timedelta(days=1)),
        "client_id": client_obj.id,
        "vehicle_id": vehicle_obj.id,
        "work_status": WorkStatus.PENDING.value,
        "payment_status": PaymentStatus.NOT_PAID.value,
        "workers": "John Doe"
    }

def test_list_work_orders(client, db_session):
    from app.models.client import Client
    from app.models.vehicle import Vehicle
    from app.models.work_order import WorkOrder, WorkStatus, PaymentStatus

    client_obj = Client(name="Nico Test", email="nico@test.com", phone_number="123456789")
    db_session.add(client_obj)
    db_session.commit()
    db_session.refresh(client_obj)

    vehicle_obj = Vehicle(
        vehicle_type="Car",
        brand_model="Toyota Corolla",
        kilometers=0,
        plate_number="AAA-111",
        owner_id=client_obj.id
    )
    db_session.add(vehicle_obj)
    db_session.commit()
    db_session.refresh(vehicle_obj)

    work_order_obj = WorkOrder(
        entry_date=date(2025, 11, 22),
        egress_date=date(2025, 11, 23),
        client_id=client_obj.id,
        vehicle_id=vehicle_obj.id,
        work_status=WorkStatus.PENDING,
        payment_status=PaymentStatus.NOT_PAID,
        workers="John Doe"
    )
    db_session.add(work_order_obj)
    db_session.commit()
    db_session.refresh(work_order_obj)

    resp = client.get("/work-orders/")
    assert resp.status_code == 200

    data = resp.json()

    assert len(data) >= 1

    first_order = data[0]
    assert first_order["workers"] == "John Doe"
    assert first_order["client_id"] == client_obj.id
    assert first_order["vehicle_id"] == vehicle_obj.id
    assert first_order["work_status"] == WorkStatus.PENDING.value
    assert first_order["payment_status"] == PaymentStatus.NOT_PAID.value


# ------------------------
# GET SINGLE WORK ORDER
# ------------------------
def test_get_work_order(test_client, work_order_payload):
    resp_create = test_client.post("/work-orders/", json=work_order_payload)
    order_id = resp_create.json()["id"]

    resp = test_client.get(f"/work-orders/{order_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == order_id
    assert data["workers"] == work_order_payload["workers"]

# ------------------------
# UPDATE WORK ORDER
# ------------------------
def test_update_work_order(test_client, work_order_payload):
    resp_create = test_client.post("/work-orders/", json=work_order_payload)
    order_id = resp_create.json()["id"]

    update_payload = {"workers": "Jane Smith"}
    resp = test_client.put(f"/work-orders/{order_id}", json=update_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["workers"] == "Jane Smith"

# ------------------------
# DELETE WORK ORDER
# ------------------------
def test_delete_work_order(test_client, work_order_payload):
    resp_create = test_client.post("/work-orders/", json=work_order_payload)
    order_id = resp_create.json()["id"]

    resp = test_client.delete(f"/work-orders/{order_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["message"] == "Work order deleted"

    resp_check = test_client.get(f"/work-orders/{order_id}")
    assert resp_check.status_code == 404
