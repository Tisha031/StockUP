"""
OTP Model
Collection: otp_verifications

Maps to the OTP Verification page: 4-digit code, sent live to the
user's registered email, with expiry + attempt limiting per your notes.
"""

import sys
from pathlib import Path
import random
from datetime import datetime, timedelta, timezone

# Add parent directories to path for imports
app_dir = Path(__file__).resolve().parent.parent.parent
if str(app_dir) not in sys.path:
    sys.path.insert(0, str(app_dir))

from endpoints.config.db import get_db

OTP_EXPIRY_MINUTES = 5
OTP_LENGTH = 4
MAX_ATTEMPTS = 5


class OTP:
    collection_name = "otp_verifications"

    def __init__(self, email, otp_code, created_at=None, expires_at=None,
                 is_used=False, attempts=0, _id=None):
        self._id = _id
        self.email = email.lower().strip()
        self.otp_code = otp_code
        self.created_at = created_at or datetime.now(timezone.utc)
        self.expires_at = expires_at or (
            self.created_at + timedelta(minutes=OTP_EXPIRY_MINUTES)
        )
        self.is_used = is_used
        self.attempts = attempts

    def to_dict(self):
        return {
            "email": self.email,
            "otp_code": self.otp_code,
            "created_at": self.created_at,
            "expires_at": self.expires_at,
            "is_used": self.is_used,
            "attempts": self.attempts,
        }

    @staticmethod
    def generate_otp_code() -> str:
        return str(random.randint(10 ** (OTP_LENGTH - 1), (10 ** OTP_LENGTH) - 1))

    @classmethod
    def create(cls, email: str) -> str:
        """Invalidates any still-active OTP for this email, generates a
        fresh one, and returns the plain code (caller is responsible for
        emailing it via utils/email_sender.py)."""
        db = get_db()
        clean_email = email.lower().strip()

        db[cls.collection_name].update_many(
            {"email": clean_email, "is_used": False},
            {"$set": {"is_used": True}},
        )

        otp = cls(email=clean_email, otp_code=cls.generate_otp_code())
        db[cls.collection_name].insert_one(otp.to_dict())
        return otp.otp_code

    @classmethod
    def verify(cls, email: str, submitted_code: str) -> dict:
        """Returns {"success": bool, "message": str}."""
        db = get_db()
        clean_email = email.lower().strip()

        record = db[cls.collection_name].find_one(
            {"email": clean_email, "is_used": False},
            sort=[("created_at", -1)],
        )

        if not record:
            return {"success": False, "message": "No active OTP found. Please request a new one."}

        expires_at = record["expires_at"]
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            return {"success": False, "message": "OTP expired. Please request a new one."}

        if record["attempts"] >= MAX_ATTEMPTS:
            return {"success": False, "message": "Too many incorrect attempts. Please request a new OTP."}

        db[cls.collection_name].update_one(
            {"_id": record["_id"]}, {"$inc": {"attempts": 1}}
        )

        if record["otp_code"] != submitted_code:
            return {"success": False, "message": "Incorrect OTP."}

        db[cls.collection_name].update_one(
            {"_id": record["_id"]}, {"$set": {"is_used": True}}
        )
        return {"success": True, "message": "OTP verified successfully."}

    @classmethod
    def ensure_indexes(cls):
        db = get_db()
        db[cls.collection_name].create_index("email")
        # TTL index: MongoDB auto-deletes the document once expires_at passes
        db[cls.collection_name].create_index("expires_at", expireAfterSeconds=0)