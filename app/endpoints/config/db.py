"""
MongoDB connection handler.
Single shared connection reused across the app (avoid opening a new
client per request).
"""

import os
import sys
from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv

# Add parent directories to path for imports
app_dir = Path(__file__).resolve().parent.parent.parent
if str(app_dir) not in sys.path:
    sys.path.insert(0, str(app_dir))

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "stockup_db")

_client = None
_db = None


def get_db():
    """Returns the active MongoDB database handle, creating the
    connection on first use."""
    global _client, _db
    if _db is None:
        _client = MongoClient(MONGO_URI)
        _db = _client[DB_NAME]
    return _db


def init_indexes():
    """Call once at app startup (from app.py) to make sure required
    indexes exist."""
    from endpoints.models.user_model import User
    from endpoints.models.otp_model import OTP
    from endpoints.models.reset_token_model import ResetToken

    User.ensure_indexes()
    OTP.ensure_indexes()
    ResetToken.ensure_indexes()