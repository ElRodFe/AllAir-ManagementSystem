import pytest
from pydantic import ValidationError
from app.schemas.user import UserCreate, UserUpdate
from app.models.user import UserRole

# --- VALID CASE
def test_user_create_valid():
    user = UserCreate(
        username="ValidUser",
        password="Password@123",
        role=UserRole.ADMIN
    )
    assert user.username == "ValidUser"
    assert user.password == "Password@123"
    assert user.role == UserRole.ADMIN

# --- INVALID USERNAMES
@pytest.mark.parametrize("invalid_username", [
    "",          # empty
    "   ",       # spaces only
    "Bad User"   # contains space
])
def test_user_create_invalid_username(invalid_username):
    with pytest.raises(ValidationError) as exc_info:
        UserCreate(
            username=invalid_username,
            password="Password@123",
            role=UserRole.ADMIN
        )
    assert "username" in str(exc_info.value).lower()

# --- INVALID PASSWORD RULES
@pytest.mark.parametrize("invalid_password", [
    "password@123",  # no uppercase
    "Password123",   # no special char
    "P@1"            # too short
])
def test_user_create_invalid_password(invalid_password):
    with pytest.raises(ValidationError) as exc_info:
        UserCreate(
            username="ValidUser",
            password=invalid_password,
            role=UserRole.ADMIN
        )
    assert "password" in str(exc_info.value).lower()

# --- UPDATE SCHEMA
@pytest.mark.parametrize("update_data", [
    {"username": "NewName"},
    {"password": "NewPass@1"},
    {"role": UserRole.ADMIN},
    {"username": "Another", "password": "Valid@123", "role": UserRole.EMPLOYEE}
])
def test_user_update_valid(update_data):
    user = UserUpdate(**update_data)
    for key, value in update_data.items():
        assert getattr(user, key) == value

@pytest.mark.parametrize("invalid_update_password", [
    "weak",           # fails uppercase & special char
    "nopunctuation",  # missing special char
    "SR1@"         # too short
])
def test_user_update_invalid_password(invalid_update_password):
    with pytest.raises(ValidationError) as exc_info:
        UserUpdate(password=invalid_update_password)
    assert "password" in str(exc_info.value).lower()
