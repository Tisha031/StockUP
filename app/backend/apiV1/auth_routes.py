"""
Authentication Routes
Handles registration, OTP verification, login, and password reset endpoints with JWT support.
"""

import os
from flask import Blueprint, request, jsonify
from endpoints.models.user_model import User
from endpoints.models.otp_model import OTP
from endpoints.models.reset_token_model import ResetToken
from endpoints.utils.validators import (
    validate_registration_payload,
    validate_login_payload,
    validate_otp_payload,
    validate_forgot_password_payload,
    validate_reset_password_payload,
    validate_change_password_payload,
)
from endpoints.auth.email_utils import send_otp_email, send_password_reset_email
from endpoints.auth.jwt_utils import JWTManager, jwt_required

auth_bp = Blueprint("auth", __name__)

# Frontend URL for password reset links
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    POST /api/v1/auth/register
    Body: { "email": "user@example.com", "password": "SecurePass1!" }
    
    Creates a new unverified user and sends OTP to email.
    """
    data = request.get_json() or {}
    
    # Validate input
    errors = validate_registration_payload(data)
    if errors:
        return jsonify({"success": False, "errors": errors}), 400
    
    email = data["email"]
    password = data["password"]
    
    # Create user
    user_id = User.create(email, password)
    if user_id is None:
        return jsonify({
            "success": False,
            "message": "Email already registered. Please login or reset your password."
        }), 409
    
    # Generate and send OTP
    try:
        otp_code = OTP.create(email)
        send_otp_email(email, otp_code)
        
        return jsonify({
            "success": True,
            "message": "Registration successful. Please check your email for the verification code.",
            "email": email
        }), 201
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"User created but failed to send OTP: {str(e)}"
        }), 500


@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    """
    POST /api/v1/auth/verify-otp
    Body: { "email": "user@example.com", "otp_code": "1234" }
    
    Verifies the OTP and marks the user as verified.
    """
    data = request.get_json() or {}
    
    # Validate input
    errors = validate_otp_payload(data)
    if errors:
        return jsonify({"success": False, "errors": errors}), 400
    
    email = data["email"]
    otp_code = data["otp_code"]
    
    # Verify OTP
    result = OTP.verify(email, otp_code)
    
    if result["success"]:
        # Mark user as verified
        User.mark_verified(email)
        return jsonify({
            "success": True,
            "message": "Email verified successfully. You can now login."
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": result["message"]
        }), 400


@auth_bp.route("/resend-otp", methods=["POST"])
def resend_otp():
    """
    POST /api/v1/auth/resend-otp
    Body: { "email": "user@example.com" }
    
    Generates a new OTP and sends it to the user's email.
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip()
    
    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400
    
    # Check if user exists
    user = User.find_by_email(email)
    if not user:
        return jsonify({
            "success": False,
            "message": "No account found with this email."
        }), 404
    
    if user.get("is_verified", False):
        return jsonify({
            "success": False,
            "message": "This account is already verified. Please login."
        }), 400
    
    # Generate and send new OTP
    try:
        otp_code = OTP.create(email)
        send_otp_email(email, otp_code)
        
        return jsonify({
            "success": True,
            "message": "A new verification code has been sent to your email."
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to send OTP: {str(e)}"
        }), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /api/v1/auth/login
    Body: { "email": "user@example.com", "password": "SecurePass1!" }
    
    Authenticates the user and returns user info with JWT token.
    """
    data = request.get_json() or {}
    
    # Validate input
    errors = validate_login_payload(data)
    if errors:
        return jsonify({"success": False, "errors": errors}), 400
    
    email = data["email"]
    password = data["password"]
    
    # Authenticate user
    user = User.authenticate(email, password)
    
    if not user:
        return jsonify({
            "success": False,
            "message": "Invalid email or password, or account not verified."
        }), 401
    
    # Generate JWT token
    try:
        access_token = JWTManager.generate_access_token(email)
        
        # Update last login
        User.update_last_login(email)
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "email": user["email"],
                "is_verified": user["is_verified"],
                "created_at": user["created_at"].isoformat() if user.get("created_at") else None,
                "last_login": user["last_login"].isoformat() if user.get("last_login") else None
            }
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Login successful but failed to generate token: {str(e)}"
        }), 500


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """
    POST /api/v1/auth/forgot-password
    Body: { "email": "user@example.com" }
    
    Sends a password reset token to the user's email.
    """
    data = request.get_json() or {}
    
    # Validate input
    errors = validate_forgot_password_payload(data)
    if errors:
        return jsonify({"success": False, "errors": errors}), 400
    
    email = data["email"]
    
    # Check if user exists and is verified
    user = User.find_by_email(email)
    if not user:
        # Don't reveal if email exists or not for security
        return jsonify({
            "success": True,
            "message": "If an account with this email exists, you will receive password reset instructions."
        }), 200
    
    if not user.get("is_verified", False):
        return jsonify({
            "success": False,
            "message": "Please verify your email address first before resetting your password."
        }), 400
    
    # Generate reset token
    try:
        reset_token = ResetToken.create(email)
        reset_url = f"{FRONTEND_URL}/reset-password?email={email}&token={reset_token}"
        
        send_password_reset_email(email, reset_token, reset_url)
        
        return jsonify({
            "success": True,
            "message": "If an account with this email exists, you will receive password reset instructions."
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to send password reset email: {str(e)}"
        }), 500


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """
    POST /api/v1/auth/reset-password
    Body: { "email": "user@example.com", "token": "123456", "new_password": "NewPass1!" }
    
    Resets the user's password using the provided token.
    """
    data = request.get_json() or {}
    
    # Validate input
    errors = validate_reset_password_payload(data)
    if errors:
        return jsonify({"success": False, "errors": errors}), 400
    
    email = data["email"]
    token = data["token"]
    new_password = data["new_password"]
    
    # Verify reset token
    result = ResetToken.verify(email, token)
    
    if not result["success"]:
        return jsonify({
            "success": False,
            "message": result["message"]
        }), 400
    
    # Check if user exists
    user = User.find_by_email(email)
    if not user:
        return jsonify({
            "success": False,
            "message": "User not found."
        }), 404
    
    # Reset password
    try:
        User.reset_password(email, new_password)
        
        return jsonify({
            "success": True,
            "message": "Password reset successfully. You can now login with your new password."
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to reset password: {str(e)}"
        }), 500


@auth_bp.route("/check-email", methods=["POST"])
def check_email():
    """
    POST /api/v1/auth/check-email
    Body: { "email": "user@example.com" }
    
    Checks if an email is already registered.
    """
    data = request.get_json() or {}
    email = data.get("email", "").strip()
    
    if not email:
        return jsonify({"success": False, "message": "Email is required."}), 400
    
    user = User.find_by_email(email)
    
    return jsonify({
        "success": True,
        "exists": user is not None,
        "is_verified": user.get("is_verified", False) if user else False
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required
def get_current_user():
    """
    GET /api/v1/auth/me
    Headers: { "Authorization": "Bearer <jwt_token>" }
    
    Returns current user information (protected route).
    """
    user = request.current_user
    
    return jsonify({
        "success": True,
        "user": {
            "email": user["email"],
            "is_verified": user["is_verified"],
            "created_at": user["created_at"].isoformat() if user.get("created_at") else None,
            "last_login": user["last_login"].isoformat() if user.get("last_login") else None
        }
    }), 200


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required
def refresh_token():
    """
    POST /api/v1/auth/refresh
    Headers: { "Authorization": "Bearer <jwt_token>" }
    
    Returns a new JWT token (protected route).
    """
    user = request.current_user
    
    try:
        new_token = JWTManager.generate_access_token(user["email"])
        
        return jsonify({
            "success": True,
            "access_token": new_token,
            "message": "Token refreshed successfully"
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to refresh token: {str(e)}"
        }), 500


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required
def change_password():
    """
    POST /api/v1/auth/change-password
    Headers: { "Authorization": "Bearer <jwt_token>" }
    Body: { "old_password": "OldPass1!", "new_password": "NewPass1!" }
    
    Changes the user's password (requires old password verification).
    Protected route - user must be logged in.
    """
    user = request.current_user
    data = request.get_json() or {}
    
    # Validate input
    errors = validate_change_password_payload(data)
    if errors:
        return jsonify({"success": False, "errors": errors}), 400
    
    old_password = data["old_password"]
    new_password = data["new_password"]
    
    # Verify old password
    if not User.verify_password(old_password, user["password_hash"]):
        return jsonify({
            "success": False,
            "message": "Current password is incorrect."
        }), 401
    
    # Update password
    try:
        User.reset_password(user["email"], new_password)
        
        return jsonify({
            "success": True,
            "message": "Password changed successfully."
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Failed to change password: {str(e)}"
        }), 500
