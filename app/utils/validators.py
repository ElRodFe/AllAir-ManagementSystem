import re
from typing import Optional
from datetime import date

# -----------------------------
# STRING VALIDATION
# -----------------------------
def validate_required_string(value: str, field: str) -> str:
    if not value or value.strip() == "":
        raise ValueError(f"{field} cannot be empty or spaces only")
    return value


def validate_optional_string(value: Optional[str], field_name: str) -> Optional[str]:
    if value is None:
        return None

    if isinstance(value, str) and value.strip() == "":
        return None

    if isinstance(value, str):
        return value.strip()

    return str(value).strip()


# -----------------------------
# REGEX VALIDATION
# -----------------------------
def validate_regex(value: str, pattern: str, field: str, message: str) -> str:
    if not re.fullmatch(pattern, value):
        raise ValueError(f"{field}: {message}")
    return value


def validate_optional_regex(value: Optional[str], pattern: str, field: str, message: str) -> Optional[str]:
    if value is not None and not re.fullmatch(pattern, value):
        raise ValueError(f"{field}: {message}")
    return value


# -----------------------------
# DATE VALIDATION
# -----------------------------
def validate_egress_not_before_entry(entry: Optional[date], egress: Optional[date]) -> Optional[date]:
    if entry and egress and egress < entry:
        raise ValueError("Egress date cannot be earlier than entry date")
    return egress
