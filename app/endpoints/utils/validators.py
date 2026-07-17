"""
Reusable validation helpers for the Registration / Login / OTP flows.

Rules taken directly from the wireframe notes:
  - Form input validation
  - Password: 6+ characters, must include a number and a special character
  - Email: standard format validation
  - All fields required
"""

import re

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

# 6+ chars, at least 1 letter, 1 digit, 1 special character
PASSWORD_REGEX = re.compile(r"^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^_\-]).{6,}$")

OTP_REGEX = re.compile(r"^\d{4}$")

RESET_TOKEN_REGEX = re.compile(r"^\d{6}$")


def is_valid_email(email: str) -> bool:
    return bool(email) and bool(EMAIL_REGEX.match(email.strip()))


def is_valid_password(password: str) -> bool:
    return bool(password) and bool(PASSWORD_REGEX.match(password))


def is_valid_otp_format(otp_code: str) -> bool:
    return bool(otp_code) and bool(OTP_REGEX.match(otp_code.strip()))


def is_valid_reset_token_format(token: str) -> bool:
    return bool(token) and bool(RESET_TOKEN_REGEX.match(token.strip()))


def validate_registration_payload(data: dict) -> list:
    """Returns a list of error messages. Empty list = valid."""
    errors = []
    email = (data or {}).get("email", "")
    password = (data or {}).get("password", "")

    if not email:
        errors.append("Email is required.")
    elif not is_valid_email(email):
        errors.append("Invalid email format.")

    if not password:
        errors.append("Password is required.")
    elif not is_valid_password(password):
        errors.append(
            "Password must be at least 6 characters and include a number and a special character."
        )

    return errors


def validate_login_payload(data: dict) -> list:
    errors = []
    if not (data or {}).get("email"):
        errors.append("Email is required.")
    if not (data or {}).get("password"):
        errors.append("Password is required.")
    return errors


def validate_otp_payload(data: dict) -> list:
    errors = []
    email = (data or {}).get("email", "")
    otp_code = (data or {}).get("otp_code", "")

    if not email or not is_valid_email(email):
        errors.append("A valid email is required.")
    if not otp_code:
        errors.append("OTP is required.")
    elif not is_valid_otp_format(otp_code):
        errors.append("OTP must be a 4-digit code.")

    return errors


def validate_forgot_password_payload(data: dict) -> list:
    """Validate forgot password request payload."""
    errors = []
    email = (data or {}).get("email", "")

    if not email:
        errors.append("Email is required.")
    elif not is_valid_email(email):
        errors.append("Invalid email format.")

    return errors


def validate_reset_password_payload(data: dict) -> list:
    """Validate password reset payload."""
    errors = []
    email = (data or {}).get("email", "")
    token = (data or {}).get("token", "")
    new_password = (data or {}).get("new_password", "")

    if not email or not is_valid_email(email):
        errors.append("A valid email is required.")
    
    if not token:
        errors.append("Reset token is required.")
    elif not is_valid_reset_token_format(token):
        errors.append("Reset token must be a 6-digit code.")

    if not new_password:
        errors.append("New password is required.")
    elif not is_valid_password(new_password):
        errors.append(
            "Password must be at least 6 characters and include a number and a special character."
        )

    return errors


def validate_change_password_payload(data: dict) -> list:
    """Validate change password payload (for logged-in users)."""
    errors = []
    old_password = (data or {}).get("old_password", "")
    new_password = (data or {}).get("new_password", "")

    if not old_password:
        errors.append("Current password is required.")
    
    if not new_password:
        errors.append("New password is required.")
    elif not is_valid_password(new_password):
        errors.append(
            "New password must be at least 6 characters and include a number and a special character."
        )
    
    if old_password and new_password and old_password == new_password:
        errors.append("New password must be different from current password.")

    return errors