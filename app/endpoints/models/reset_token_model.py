"""
Password Reset Token Model
Manages password reset tokens with expiration.
"""

import random
from datetime import datetime, timedelta, timezone
from endpoints.config.db import get_db

# Token Configuration
RESET_TOKEN_EXPIRY_HOURS = 1  # Reset tokens expire in 1 hour
RESET_TOKEN_LENGTH = 6  # 6-digit reset tokens


class ResetToken:
    collection_name = "password_reset_tokens"

    def __init__(self, email, reset_token, created_at=None, expires_at=None,
                 is_used=False, attempts=0, _id=None):
        self._id = _id
        self.email = email.lower().strip()
        self.reset_token = reset_token
        self.created_at = created_at or datetime.now(timezone.utc)
        self.expires_at = expires_at or (
            self.created_at + timedelta(hours=RESET_TOKEN_EXPIRY_HOURS)
        )
        self.is_used = is_used
        self.attempts = attempts

    def to_dict(self):
        return {
            "email": self.email,
            "reset_token": self.reset_token,
            "created_at": self.created_at,
            "expires_at": self.expires_at,
            "is_used": self.is_used,
            "attempts": self.attempts,
        }

    @staticmethod
    def generate_reset_token() -> str:
        """Generate a 6-digit reset token"""
        return str(random.randint(10 ** (RESET_TOKEN_LENGTH - 1), (10 ** RESET_TOKEN_LENGTH) - 1))

    @classmethod
    def create(cls, email: str) -> str:
        """
        Invalidates any active reset tokens for this email, 
        generates a fresh one, and returns the plain token.
        """
        db = get_db()
        clean_email = email.lower().strip()

        # Invalidate existing tokens
        db[cls.collection_name].update_many(
            {"email": clean_email, "is_used": False},
            {"$set": {"is_used": True}},
        )

        # Create new token
        reset_token = cls(email=clean_email, reset_token=cls.generate_reset_token())
        db[cls.collection_name].insert_one(reset_token.to_dict())
        return reset_token.reset_token

    @classmethod
    def verify(cls, email: str, submitted_token: str) -> dict:
        """
        Verifies the reset token.
        Returns {"success": bool, "message": str}.
        """
        db = get_db()
        clean_email = email.lower().strip()

        # Find the most recent active token
        record = db[cls.collection_name].find_one(
            {"email": clean_email, "is_used": False},
            sort=[("created_at", -1)],
        )

        if not record:
            return {"success": False, "message": "No active reset token found. Please request a new one."}

        # Check if token has expired
        # Handle timezone-naive datetime from MongoDB
        expires_at = record["expires_at"]
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        if expires_at < datetime.now(timezone.utc):
            # Mark as used
            db[cls.collection_name].update_one(
                {"_id": record["_id"]},
                {"$set": {"is_used": True}},
            )
            return {"success": False, "message": "Reset token has expired. Please request a new one."}

        # Increment attempts
        attempts = record.get("attempts", 0) + 1
        db[cls.collection_name].update_one(
            {"_id": record["_id"]},
            {"$set": {"attempts": attempts}},
        )

        # Check attempt limit
        if attempts > 5:  # Max 5 attempts
            db[cls.collection_name].update_one(
                {"_id": record["_id"]},
                {"$set": {"is_used": True}},
            )
            return {"success": False, "message": "Too many attempts. Please request a new reset token."}

        # Verify token
        if record["reset_token"] != submitted_token:
            return {"success": False, "message": "Invalid reset token."}

        # Mark token as used
        db[cls.collection_name].update_one(
            {"_id": record["_id"]},
            {"$set": {"is_used": True}},
        )

        return {"success": True, "message": "Reset token verified successfully."}

    @classmethod
    def cleanup_expired(cls):
        """Remove expired tokens (optional maintenance task)"""
        db = get_db()
        db[cls.collection_name].delete_many(
            {"expires_at": {"$lt": datetime.now(timezone.utc)}}
        )

    @classmethod
    def ensure_indexes(cls):
        """Create indexes for password reset tokens collection"""
        db = get_db()
        db[cls.collection_name].create_index("email")
        # TTL index: MongoDB auto-deletes the document once expires_at passes
        db[cls.collection_name].create_index("expires_at", expireAfterSeconds=0)