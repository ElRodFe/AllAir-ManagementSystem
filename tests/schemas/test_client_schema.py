import pytest
from pydantic import ValidationError
from app.schemas.client import ClientCreate, ClientUpdate

# --- VALID CASES
@pytest.mark.parametrize(
    "name,phone,email",
    [
        ("John Doe", "+1 555-123-4567", "john@example.com"),
        ("Alice", "555 987 6543", None),  # email optional
    ]
)
def test_client_create_valid(name, phone, email):
    client = ClientCreate(name=name, phone_number=phone, email=email)
    assert client.name == name
    assert client.phone_number == phone
    assert client.email == email

@pytest.mark.parametrize(
    "name,phone,email",
    [
        (None, None, None),  # all optional
        ("Jane Smith", "555 987 6543", "jane@example.com")
    ]
)
def test_client_update_valid(name, phone, email):
    update_data = ClientUpdate(name=name, phone_number=phone, email=email)
    assert update_data.name == name
    assert update_data.phone_number == phone
    assert update_data.email == email


# --- INVALID ClientCreate FIELDS
@pytest.mark.parametrize(
    "name,expected_msg",
    [
        ("", "Name cannot be empty or spaces only"),
        ("   ", "Name cannot be empty or spaces only")
    ]
)
def test_client_create_invalid_name(name, expected_msg):
    with pytest.raises(ValidationError) as exc_info:
        ClientCreate(name=name, phone_number="1234567", email="test@test.com")
    assert expected_msg in str(exc_info.value)

@pytest.mark.parametrize(
    "phone,expected_msg",
    [
        ("abc123", "Phone number"),
        ("", "Phone number cannot be empty"),
        ("    ", "Phone number cannot be empty")
    ]
)
def test_client_create_invalid_phone(phone, expected_msg):
    with pytest.raises(ValidationError) as exc_info:
        ClientCreate(name="John Doe", phone_number=phone, email="test@test.com")
    assert expected_msg in str(exc_info.value)

@pytest.mark.parametrize(
    "email",
    ["invalid-email", "test@", "test.com"]
)
def test_client_create_invalid_email(email):
    with pytest.raises(ValidationError):
        ClientCreate(name="John Doe", phone_number="1234567", email=email)

# --- INVALID ClientUpdate OPTIONAL FIELDS
@pytest.mark.parametrize(
    "field,value,expected_msg",
    [
        ("name", "   ", "Name cannot be empty or spaces only"),
        ("phone_number", "abc123", "Phone number"),
        ("email", "invalid-email", "value is not a valid email address")
    ]
)
def test_client_update_invalid_optional_fields(field, value, expected_msg):
    kwargs = {field: value}
    with pytest.raises(ValidationError) as exc_info:
        ClientUpdate(**kwargs)
    assert expected_msg in str(exc_info.value)
