"""
StockUP Backend Application
Main Flask app with authentication routes and MongoDB connection.
"""

import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from endpoints.config.db import init_indexes, get_db
from backend.apiV1.auth_routes import auth_bp

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fallback-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 86400))

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")


@app.route("/")
def index():
    return {"message": "StockUP API is running", "status": "ok"}


@app.route("/api/health")
def health():
    """Health check endpoint to verify MongoDB connection."""
    try:
        db = get_db()
        # Ping the database
        db.command("ping")
        return {"status": "healthy", "database": "connected"}, 200
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}, 500


if __name__ == "__main__":
    # Initialize database indexes on startup
    print("Initializing database indexes...")
    try:
        init_indexes()
        print("✓ Database indexes created successfully")
    except Exception as e:
        print(f"✗ Error initializing indexes: {e}")
    
    # Test database connection
    print("Testing database connection...")
    try:
        db = get_db()
        db.command("ping")
        print("✓ MongoDB connection successful")
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
    
    print("\nStarting Flask server...")
    app.run(debug=True, host="0.0.0.0", port=5000)
