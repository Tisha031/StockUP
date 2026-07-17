"""
JWT Utilities
Handles JWT token creation, validation, and middleware functionality.
"""

import os
import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from endpoints.models.user_model import User

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-key-change-in-production")
JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 86400))  # 24 hours


class JWTManager:
    @staticmethod
    def generate_access_token(user_email: str) -> str:
        """Generate JWT access token for user"""
        payload = {
            'user_email': user_email,
            'exp': datetime.now(timezone.utc) + timedelta(seconds=JWT_ACCESS_TOKEN_EXPIRES),
            'iat': datetime.now(timezone.utc),
            'type': 'access'
        }
        
        return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')
    
    @staticmethod
    def generate_reset_token(user_email: str) -> str:
        """Generate JWT token for password reset (shorter expiry)"""
        payload = {
            'user_email': user_email,
            'exp': datetime.now(timezone.utc) + timedelta(hours=1),  # 1 hour expiry
            'iat': datetime.now(timezone.utc),
            'type': 'reset'
        }
        
        return jwt.encode(payload, JWT_SECRET_KEY, algorithm='HS256')
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=['HS256'])
            return {
                'success': True,
                'payload': payload
            }
        except jwt.ExpiredSignatureError:
            return {
                'success': False,
                'error': 'Token has expired'
            }
        except jwt.InvalidTokenError:
            return {
                'success': False,
                'error': 'Invalid token'
            }
    
    @staticmethod
    def extract_token_from_header(auth_header: str) -> str:
        """Extract token from Authorization header (Bearer <token>)"""
        if not auth_header:
            return None
        
        parts = auth_header.split()
        if parts[0].lower() != 'bearer' or len(parts) != 2:
            return None
        
        return parts[1]


def jwt_required(f):
    """Decorator to protect routes with JWT authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        token = JWTManager.extract_token_from_header(auth_header)
        
        if not token:
            return jsonify({
                'success': False,
                'message': 'Authorization token is required'
            }), 401
        
        # Verify token
        result = JWTManager.verify_token(token)
        
        if not result['success']:
            return jsonify({
                'success': False,
                'message': result['error']
            }), 401
        
        # Check if user exists and is verified
        user_email = result['payload']['user_email']
        user = User.find_by_email(user_email)
        
        if not user or not user.get('is_verified', False):
            return jsonify({
                'success': False,
                'message': 'User not found or not verified'
            }), 401
        
        # Add user info to request context
        request.current_user = user
        
        return f(*args, **kwargs)
    
    return decorated_function


def jwt_optional(f):
    """Decorator to optionally check JWT authentication (doesn't fail if no token)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        token = JWTManager.extract_token_from_header(auth_header)
        
        request.current_user = None
        
        if token:
            # Verify token if present
            result = JWTManager.verify_token(token)
            
            if result['success']:
                # Check if user exists and is verified
                user_email = result['payload']['user_email']
                user = User.find_by_email(user_email)
                
                if user and user.get('is_verified', False):
                    request.current_user = user
        
        return f(*args, **kwargs)
    
    return decorated_function