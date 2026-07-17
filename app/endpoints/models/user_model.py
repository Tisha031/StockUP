"""
User Model
Collection: users

Maps to the Registration page (email + create password) and the
Login page (email + password) from the wireframes.
"""

import sys
from pathlib import Path
from datetime import datetime, timezone
import bcrypt

# Add parent directories to path for imports
app_dir = Path(__file__).resolve().parent.parent.parent
if str(app_dir) not in sys.path:
    sys.path.insert(0, str(app_dir))

from endpoints.config.db import get_db


class User:
    collection_name = "users"

    def __init__(self, email, password_hash, is_verified=False,
                 created_at=None, updated_at=None, last_login=None, _id=None):
        self._id = _id
        self.email = email.lower().strip()
        self.password_hash = password_hash
        self.is_verified = is_verified
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)
        self.last_login = last_login

    # ---------- Serialization ----------
    def to_dict(self):
        return {
            "email": self.email,
            "password_hash": self.password_hash,
            "is_verified": self.is_verified,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "last_login": self.last_login,
        }

    # ---------- Password helpers ----------
    @staticmethod
    def hash_password(plain_password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, password_hash: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), password_hash.encode("utf-8")
        )

    # ---------- DB operations ----------
    @classmethod
    def create(cls, email: str, plain_password: str):
        """Create a new, unverified user.
        Returns the inserted_id, or None if the email is already registered."""
        db = get_db()
        clean_email = email.lower().strip()

        if db[cls.collection_name].find_one({"email": clean_email}):
            return None  # email already registered

        user = cls(email=clean_email, password_hash=cls.hash_password(plain_password))
        result = db[cls.collection_name].insert_one(user.to_dict())
        return result.inserted_id

    @classmethod
    def find_by_email(cls, email: str):
        db = get_db()
        return db[cls.collection_name].find_one({"email": email.lower().strip()})

    @classmethod
    def mark_verified(cls, email: str):
        """Called after a successful OTP check on the registration flow."""
        db = get_db()
        db[cls.collection_name].update_one(
            {"email": email.lower().strip()},
            {"$set": {"is_verified": True, "updated_at": datetime.now(timezone.utc)}},
        )

    @classmethod
    def update_last_login(cls, email: str):
        db = get_db()
        db[cls.collection_name].update_one(
            {"email": email.lower().strip()},
            {"$set": {"last_login": datetime.now(timezone.utc)}},
        )

    @classmethod
    def reset_password(cls, email: str, new_password: str):
        """Reset user's password (used after token verification)"""
        db = get_db()
        db[cls.collection_name].update_one(
            {"email": email.lower().strip()},
            {
                "$set": {
                    "password_hash": cls.hash_password(new_password),
                    "updated_at": datetime.now(timezone.utc)
                }
            },
        )

    @classmethod
    def authenticate(cls, email: str, plain_password: str):
        """Used by the Login page. Returns the user doc if credentials
        are valid AND the account is verified, else None."""
        user = cls.find_by_email(email)
        if not user:
            return None
        if not cls.verify_password(plain_password, user["password_hash"]):
            return None
        if not user.get("is_verified", False):
            return None
        return user

    @classmethod
    def ensure_indexes(cls):
        db = get_db()
        db[cls.collection_name].create_index("email", unique=True)