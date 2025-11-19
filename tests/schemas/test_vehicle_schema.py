import pytest
from pydantic import ValidationError
from app.schemas.vehicle import VehicleCreate, VehicleUpdate

# --- VALID CASES
@pytest.mark.parametrize(
    "vehicle_type,brand_model,kilometers,plate_number,owner_id",
    [
        ("Car", "Toyota Corolla", 12000, "ABC-123", 1),
        ("Truck", "Ford F150", 50000, "XYZ-987", 2),
    ]
)
def test_vehicle_create_valid(vehicle_type, brand_model, kilometers, plate_number, owner_id):
    vehicle = VehicleCreate(
        vehicle_type=vehicle_type,
        brand_model=brand_model,
        kilometers=kilometers,
        plate_number=plate_number,
        owner_id=owner_id
    )
    assert vehicle.vehicle_type == vehicle_type
    assert vehicle.brand_model == brand_model
    assert vehicle.kilometers == kilometers
    assert vehicle.plate_number == plate_number.upper()
    assert vehicle.owner_id == owner_id

@pytest.mark.parametrize(
    "vehicle_type,brand_model,kilometers,plate_number,owner_id",
    [
        (None, None, None, None, None),  # all optional
        ("Bike", "Honda CB500", 2000, "BIKE-01", 3)
    ]
)
def test_vehicle_update_valid(vehicle_type, brand_model, kilometers, plate_number, owner_id):
    update_data = VehicleUpdate(
        vehicle_type=vehicle_type,
        brand_model=brand_model,
        kilometers=kilometers,
        plate_number=plate_number,
        owner_id=owner_id
    )
    assert update_data.vehicle_type == vehicle_type
    assert update_data.brand_model == brand_model
    assert update_data.kilometers == kilometers
    assert update_data.plate_number == (plate_number.upper() if plate_number else plate_number)
    assert update_data.owner_id == owner_id

# --- INVALID VehicleCreate REQUIRED FIELDS
@pytest.mark.parametrize(
    "field,value,expected_msg",
    [
        ("vehicle_type", "", "Vehicle type cannot be empty or spaces only"),
        ("vehicle_type", "   ", "Vehicle type cannot be empty or spaces only"),
        ("brand_model", "", "Brand/Model cannot be empty or spaces only"),
        ("brand_model", "   ", "Brand/Model cannot be empty or spaces only"),
        ("kilometers", -10, "Input should be greater than or equal to 0"),
        ("plate_number", "", "Plate number cannot be empty or spaces only"),
        ("plate_number", "abc 123", "Plate number"),
        ("owner_id", 0, "Input should be greater than or equal to 1")
    ]
)
def test_vehicle_create_invalid_fields(field, value, expected_msg):
    kwargs = {
        "vehicle_type": "Car",
        "brand_model": "Toyota Corolla",
        "kilometers": 10000,
        "plate_number": "ABC-123",
        "owner_id": 1
    }
    kwargs[field] = value
    with pytest.raises(ValidationError) as exc_info:
        VehicleCreate(**kwargs)
    assert expected_msg in str(exc_info.value)

# --- INVALID VehicleUpdate OPTIONAL FIELDS
@pytest.mark.parametrize(
    "field,value,expected_msg",
    [
        ("vehicle_type", "   ", "Vehicle type cannot be empty or spaces only"),
        ("brand_model", "   ", "Brand/Model cannot be empty or spaces only"),
        ("kilometers", -5, "Input should be greater than or equal to 0"),
        ("plate_number", "bad plate", "Plate number"),
        ("owner_id", 0, "Input should be greater than or equal to 1")
    ]
)
def test_vehicle_update_invalid_optional_fields(field, value, expected_msg):
    kwargs = {field: value}
    with pytest.raises(ValidationError) as exc_info:
        VehicleUpdate(**kwargs)
    assert expected_msg in str(exc_info.value)
