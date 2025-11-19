import pytest
from datetime import date, timedelta
from pydantic import ValidationError
from app.schemas.work_order import WorkOrderCreate, WorkOrderUpdate
from app.models.work_order import WorkStatus, PaymentStatus

# --- VALID CASES

@pytest.mark.parametrize(
    "entry,egress,client_id,vehicle_id,workers,spare_parts,details,hours",
    [
        (
            date.today(),
            date.today() + timedelta(days=1),
            1,
            1,
            "Alice, Bob",
            "Filter, Oil",
            "Routine maintenance",
            5
        ),
        (
            date.today(),
            None,
            2,
            3,
            "Charlie",
            None,
            None,
            None
        )
    ]
)
def test_work_order_create_valid(entry, egress, client_id, vehicle_id, workers, spare_parts, details, hours):
    wo = WorkOrderCreate(
        entry_date=entry,
        egress_date=egress,
        client_id=client_id,
        vehicle_id=vehicle_id,
        workers=workers,
        spare_parts=spare_parts,
        details=details,
        hours=hours
    )
    assert wo.entry_date == entry
    assert wo.egress_date == egress
    assert wo.client_id == client_id
    assert wo.vehicle_id == vehicle_id
    assert wo.workers == workers
    assert wo.spare_parts == spare_parts
    assert wo.details == details
    assert wo.hours == hours

@pytest.mark.parametrize(
    "entry,egress,client_id,vehicle_id,workers",
    [
        (date.today(), None, None, None, None),
        (date.today(), date.today() + timedelta(days=2), 1, 1, "Bob")
    ]
)
def test_work_order_update_valid(entry, egress, client_id, vehicle_id, workers):
    update_data = WorkOrderUpdate(
        entry_date=entry,
        egress_date=egress,
        client_id=client_id,
        vehicle_id=vehicle_id,
        workers=workers
    )
    assert update_data.entry_date == entry
    assert update_data.egress_date == egress
    assert update_data.client_id == client_id
    assert update_data.vehicle_id == vehicle_id
    assert update_data.workers == workers

# --- INVALID WorkOrderCreate FIELDS

@pytest.mark.parametrize(
    "field,value,expected_msg",
    [
        ("client_id", 0, "Input should be greater than or equal to 1"),
        ("vehicle_id", 0, "Input should be greater than or equal to 1"),
        ("refrigerant_gas_retrieved", -1, "Input should be greater than or equal to 0"),
        ("refrigerant_gas_injected", -5, "Input should be greater than or equal to 0"),
        ("oil_retrieved", -10, "Input should be greater than or equal to 0"),
        ("oil_injected", -2, "Input should be greater than or equal to 0"),
        ("hours", -3, "Input should be greater than or equal to 0"),
        ("workers", "   ", "Workers cannot be empty or spaces only"),
        ("spare_parts", "   ", "Spare Parts cannot be empty or spaces only"),
        ("details", "   ", "Details cannot be empty or spaces only"),
    ]
)
def test_work_order_create_invalid_fields(field, value, expected_msg):
    kwargs = {
        "entry_date": date.today(),
        "egress_date": date.today() + timedelta(days=1),
        "client_id": 1,
        "vehicle_id": 1,
        "workers": "John Doe",
        "refrigerant_gas_retrieved": 0,
        "refrigerant_gas_injected": 0,
        "oil_retrieved": 0,
        "oil_injected": 0,
        "spare_parts": "Filter",
        "details": "Routine maintenance",
        "hours": 5
    }
    kwargs[field] = value
    with pytest.raises(ValidationError) as exc_info:
        WorkOrderCreate(**kwargs)
    assert expected_msg in str(exc_info.value)

# --- INVALID WorkOrderUpdate OPTIONAL FIELDS

@pytest.mark.parametrize(
    "field,value,expected_msg",
    [
        ("client_id", 0, "Input should be greater than or equal to 1"),
        ("vehicle_id", 0, "Input should be greater than or equal to 1"),
        ("refrigerant_gas_retrieved", -1, "Input should be greater than or equal to 0"),
        ("refrigerant_gas_injected", -5, "Input should be greater than or equal to 0"),
        ("oil_retrieved", -10, "Input should be greater than or equal to 0"),
        ("oil_injected", -2, "Input should be greater than or equal to 0"),
        ("hours", -3, "Input should be greater than or equal to 0"),
        ("workers", "   ", "Workers cannot be empty or spaces only"),
        ("spare_parts", "   ", "Spare Parts cannot be empty or spaces only"),
        ("details", "   ", "Details cannot be empty or spaces only"),
    ]
)
def test_work_order_update_invalid_optional_fields(field, value, expected_msg):
    kwargs = {field: value}
    with pytest.raises(ValidationError) as exc_info:
        WorkOrderUpdate(**kwargs)
    assert expected_msg in str(exc_info.value)

# --- INVALID egress date

def test_work_order_create_egress_before_entry():
    with pytest.raises(ValidationError) as exc_info:
        WorkOrderCreate(
            entry_date=date.today(),
            egress_date=date.today() - timedelta(days=1),
            client_id=1,
            vehicle_id=1,
            workers="John"
        )
    assert "Egress date cannot be earlier than entry date" in str(exc_info.value)

def test_work_order_update_egress_before_entry():
    with pytest.raises(ValidationError) as exc_info:
        WorkOrderUpdate(
            entry_date=date.today(),
            egress_date=date.today() - timedelta(days=1)
        )
    assert "Egress date cannot be earlier than entry date" in str(exc_info.value)
