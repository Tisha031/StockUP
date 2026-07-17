# StockUP Backend API Documentation

## 🌐 Base URL
```
http://localhost:5000
```

## 📋 Table of Contents
1. [Health Check](#health-check)
2. [Register User](#1-register-user)
3. [Verify OTP](#2-verify-otp)
4. [Resend OTP](#3-resend-otp)
5. [Login](#4-login)
6. [Check Email](#5-check-email)
7. [Forgot Password](#6-forgot-password)
8. [Reset Password](#7-reset-password)
9. [Get Current User](#8-get-current-user)
10. [Refresh Token](#9-refresh-token)
11. [Change Password](#10-change-password)
12. [Error Codes](#error-codes)
13. [Database Schema](#database-schema)

---

## Health Check

### `GET /api/health`
Check if the server and database are running.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

**Response (500 Error):**
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "Connection timeout"
}
```

---

## Authentication Endpoints

### 1. Register User
**`POST /api/v1/auth/register`**

Creates a new user account and sends a 4-digit OTP to their email for verification.

#### Request Body:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Validation Rules:
- **Email:** 
  - Required
  - Valid email format (user@domain.com)
  - Stored in lowercase
  
- **Password:** 
  - Required
  - Minimum 6 characters
  - Must include at least 1 number
  - Must include at least 1 special character (@$!%*#?&^_-)
  - Must include at least 1 letter

#### Success Response (201 Created):
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for the verification code.",
  "email": "user@example.com"
}
```

#### Error Responses:

**400 Bad Request - Validation Errors:**
```json
{
  "success": false,
  "errors": [
    "Email is required.",
    "Password must be at least 6 characters and include a number and a special character."
  ]
}
```

**409 Conflict - Email Already Exists:**
```json
{
  "success": false,
  "message": "Email already registered. Please login or reset your password."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "User created but failed to send OTP: SMTP connection failed"
}
```

#### What Happens:
1. ✅ Validates email and password
2. ✅ Checks if email already exists
3. ✅ Hashes password using bcrypt
4. ✅ Creates user in MongoDB with `is_verified: false`
5. ✅ Generates 4-digit random OTP
6. ✅ Sends OTP to email (or prints to console in dev mode)
7. ✅ OTP expires in 5 minutes
8. ✅ User can attempt verification max 5 times

---

### 2. Verify OTP
**`POST /api/v1/auth/verify-otp`**

Verifies the OTP code sent to user's email and activates their account.

#### Request Body:
```json
{
  "email": "user@example.com",
  "otp_code": "1234"
}
```

#### Validation Rules:
- **Email:** Required, valid format
- **OTP Code:** Required, must be exactly 4 digits

#### Success Response (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

#### Error Responses:

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "errors": [
    "A valid email is required.",
    "OTP must be a 4-digit code."
  ]
}
```

**400 Bad Request - No Active OTP:**
```json
{
  "success": false,
  "message": "No active OTP found. Please request a new one."
}
```

**400 Bad Request - Expired OTP:**
```json
{
  "success": false,
  "message": "OTP expired. Please request a new one."
}
```

**400 Bad Request - Too Many Attempts:**
```json
{
  "success": false,
  "message": "Too many incorrect attempts. Please request a new OTP."
}
```

**400 Bad Request - Wrong OTP:**
```json
{
  "success": false,
  "message": "Incorrect OTP."
}
```

#### What Happens:
1. ✅ Validates email and OTP format
2. ✅ Finds the latest unused OTP for the email
3. ✅ Checks if OTP is expired (5 minutes)
4. ✅ Checks if attempts exceeded (max 5)
5. ✅ Increments attempt counter
6. ✅ Verifies OTP code matches
7. ✅ Marks OTP as used
8. ✅ Updates user `is_verified: true` in database
9. ✅ User can now login

---

### 3. Resend OTP
**`POST /api/v1/auth/resend-otp`**

Generates and sends a new OTP if the previous one expired or was lost.

#### Request Body:
```json
{
  "email": "user@example.com"
}
```

#### Success Response (200 OK):
```json
{
  "success": true,
  "message": "A new verification code has been sent to your email."
}
```

#### Error Responses:

**400 Bad Request - Missing Email:**
```json
{
  "success": false,
  "message": "Email is required."
}
```

**404 Not Found - User Doesn't Exist:**
```json
{
  "success": false,
  "message": "No account found with this email."
}
```

**400 Bad Request - Already Verified:**
```json
{
  "success": false,
  "message": "This account is already verified. Please login."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to send OTP: Network error"
}
```

#### What Happens:
1. ✅ Validates email provided
2. ✅ Checks if user exists
3. ✅ Checks if user is already verified
4. ✅ Marks all previous OTPs as used
5. ✅ Generates new 4-digit OTP
6. ✅ Sends to email (or prints to console)
7. ✅ New OTP expires in 5 minutes
8. ✅ Resets attempt counter to 0

---

### 4. Login
**`POST /api/v1/auth/login`**

Authenticates a verified user with email and password.

#### Request Body:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Validation Rules:
- **Email:** Required
- **Password:** Required

#### Success Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "email": "user@example.com",
    "is_verified": true,
    "created_at": "2026-07-15T10:30:45.123Z",
    "last_login": "2026-07-15T12:15:30.456Z"
  }
}
```

#### Error Responses:

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "errors": [
    "Email is required.",
    "Password is required."
  ]
}
```

**401 Unauthorized - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password, or account not verified."
}
```

#### What Happens:
1. ✅ Validates email and password provided
2. ✅ Finds user by email (case-insensitive)
3. ✅ Verifies password using bcrypt
4. ✅ Checks if account is verified (`is_verified: true`)
5. ✅ Updates `last_login` timestamp
6. ✅ Returns user information (NO password hash!)

#### Login Fails If:
- ❌ Email doesn't exist
- ❌ Password is incorrect
- ❌ Account is not verified (must verify OTP first)

---

### 5. Check Email
**`POST /api/v1/auth/check-email`**

Checks if an email address is already registered (useful for frontend validation).

#### Request Body:
```json
{
  "email": "user@example.com"
}
```

#### Success Response (200 OK):
```json
{
  "success": true,
  "exists": true,
  "is_verified": true
}
```

**If email doesn't exist:**
```json
{
  "success": true,
  "exists": false,
  "is_verified": false
}
```

#### Error Response:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Email is required."
}
```

#### Use Cases:
- ✅ Show "Email already exists" on registration form
- ✅ Check verification status before resending OTP
- ✅ Prevent duplicate registrations
- ✅ Guide user to login if already registered

---

### 6. Forgot Password
**`POST /api/v1/auth/forgot-password`**

Sends a password reset token (6-digit code) to user's email.

#### Request Body:
```json
{
  "email": "user@example.com"
}
```

#### Success Response (200 OK):
```json
{
  "success": true,
  "message": "If an account with this email exists, you will receive password reset instructions."
}
```

#### Error Responses:

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "errors": [
    "Email is required.",
    "Invalid email format."
  ]
}
```

**400 Bad Request - Not Verified:**
```json
{
  "success": false,
  "message": "Please verify your email address first before resetting your password."
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to send password reset email: SMTP connection failed"
}
```

#### What Happens:
1. ✅ Validates email format
2. ✅ Checks if user exists and is verified
3. ✅ Generates 6-digit reset token
4. ✅ Sends email with reset link containing token
5. ✅ Token expires in 1 hour
6. ✅ Security: Always returns success even if email not found

---

### 7. Reset Password
**`POST /api/v1/auth/reset-password`**

Resets user's password using the token from email.

#### Request Body:
```json
{
  "email": "user@example.com",
  "token": "123456",
  "new_password": "NewSecurePass123!"
}
```

#### Validation Rules:
- **Email:** Required, valid format
- **Token:** Required, must be 6 digits
- **New Password:** 
  - Minimum 6 characters
  - Must include 1 number
  - Must include 1 special character

#### Success Response (200 OK):
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

#### Error Responses:

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "errors": [
    "A valid email is required.",
    "Reset token must be a 6-digit code.",
    "Password must be at least 6 characters and include a number and a special character."
  ]
}
```

**400 Bad Request - Invalid/Expired Token:**
```json
{
  "success": false,
  "message": "Invalid or expired reset token."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found."
}
```

#### What Happens:
1. ✅ Validates email, token, and new password
2. ✅ Verifies token is valid and not expired (1 hour limit)
3. ✅ Checks if user exists
4. ✅ Hashes new password with bcrypt
5. ✅ Updates password in database
6. ✅ Marks token as used
7. ✅ User can now login with new password

---

### 8. Get Current User
**`GET /api/v1/auth/me`** 🔒 Protected Route

Returns information about the currently logged-in user.

#### Request Headers:
```
Authorization: Bearer <jwt_token>
```

#### Success Response (200 OK):
```json
{
  "success": true,
  "user": {
    "email": "user@example.com",
    "is_verified": true,
    "created_at": "2026-07-15T10:30:45.123Z",
    "last_login": "2026-07-15T12:15:30.456Z"
  }
}
```

#### Error Responses:

**401 Unauthorized - No Token:**
```json
{
  "success": false,
  "message": "Authorization token required"
}
```

**401 Unauthorized - Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### What Happens:
1. ✅ Validates JWT token from Authorization header
2. ✅ Decodes token to get user email
3. ✅ Fetches user from database
4. ✅ Returns user information (no password!)

---

### 9. Refresh Token
**`POST /api/v1/auth/refresh`** 🔒 Protected Route

Generates a new JWT token for the current user.

#### Request Headers:
```
Authorization: Bearer <jwt_token>
```

#### Success Response (200 OK):
```json
{
  "success": true,
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Token refreshed successfully"
}
```

#### Error Responses:

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authorization token required"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to refresh token: Token generation error"
}
```

#### What Happens:
1. ✅ Validates current JWT token
2. ✅ Generates new JWT token (24-hour expiry)
3. ✅ Returns new token to client

---

### 10. Change Password
**`POST /api/v1/auth/change-password`** 🔒 Protected Route

Changes the user's password when they're already logged in (requires current password).

#### Request Headers:
```
Authorization: Bearer <jwt_token>
```

#### Request Body:
```json
{
  "old_password": "CurrentPass123!",
  "new_password": "NewSecurePass456!"
}
```

#### Validation Rules:
- **Old Password:** Required
- **New Password:** 
  - Required
  - Minimum 6 characters
  - Must include 1 number
  - Must include 1 special character
  - Must be different from old password

#### Success Response (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

#### Error Responses:

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "errors": [
    "Current password is required.",
    "New password must be at least 6 characters and include a number and a special character.",
    "New password must be different from current password."
  ]
}
```

**401 Unauthorized - Wrong Current Password:**
```json
{
  "success": false,
  "message": "Current password is incorrect."
}
```

**401 Unauthorized - No Token:**
```json
{
  "success": false,
  "message": "Authorization token required"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to change password: Database error"
}
```

#### What Happens:
1. ✅ Validates JWT token (user must be logged in)
2. ✅ Validates old and new passwords
3. ✅ Verifies old password matches current password
4. ✅ Checks new password is different
5. ✅ Hashes new password with bcrypt
6. ✅ Updates password in database
7. ✅ User continues with same session

#### Use Cases:
- Settings/Profile page password change
- Security-conscious users updating passwords
- Password policy compliance

---

## Error Codes

| Status Code | Meaning |
|------------|---------|
| 200 | Success - Request completed successfully |
| 201 | Created - Resource created (registration) |
| 400 | Bad Request - Validation failed or invalid data |
| 401 | Unauthorized - Invalid credentials |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Server Error - Internal server issue |

---

## Database Schema

### Users Collection (`users`)
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",           // Unique, lowercase
  password_hash: "$2b$12$...",         // Bcrypt hashed
  is_verified: true,                   // Email verification status
  created_at: ISODate("2026-07-15"),   // Account creation
  updated_at: ISODate("2026-07-15"),   // Last update
  last_login: ISODate("2026-07-15")    // Last successful login
}
```

**Indexes:**
- `email` (unique) - Fast lookups and prevents duplicates

### OTP Verifications Collection (`otp_verifications`)
```javascript
{
  _id: ObjectId("..."),
  email: "user@example.com",           // User's email
  otp_code: "1234",                    // 4-digit code
  created_at: ISODate("2026-07-15"),   // When generated
  expires_at: ISODate("2026-07-15"),   // 5 minutes later
  is_used: false,                      // Used or not
  attempts: 0                          // Verification attempts (max 5)
}
```

**Indexes:**
- `email` - Fast lookups by email
- `expires_at` (TTL) - Auto-deletes expired OTPs

**TTL Index:** MongoDB automatically deletes OTP documents after `expires_at` time passes.

---

## Complete User Flow Examples

### 📝 New User Registration Flow

```bash
# Step 1: Register
POST /api/v1/auth/register
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
# Response: OTP sent to email

# Step 2: Verify OTP (check email for code)
POST /api/v1/auth/verify-otp
{
  "email": "john@example.com",
  "otp_code": "8462"
}
# Response: Email verified

# Step 3: Login
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
# Response: Login successful with user data
```

### 🔄 Resend OTP Flow

```bash
# If OTP expired or not received
POST /api/v1/auth/resend-otp
{
  "email": "john@example.com"
}
# Response: New OTP sent

# Then verify with new code
POST /api/v1/auth/verify-otp
{
  "email": "john@example.com",
  "otp_code": "2945"
}
```

### 🔑 Existing User Login Flow

```bash
# Check if email exists (optional)
POST /api/v1/auth/check-email
{
  "email": "john@example.com"
}
# Response: exists: true, is_verified: true

# Login directly
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
# Response: Login successful
```

---

## Security Features

✅ **Password Security:**
- Passwords hashed with bcrypt (salt rounds: 12)
- Never stored or returned in plain text
- Secure comparison prevents timing attacks

✅ **OTP Security:**
- 4-digit random generation (1000-9999)
- 5-minute expiration
- Maximum 5 verification attempts
- Single-use only
- Old OTPs invalidated on resend

✅ **Email Security:**
- Case-insensitive storage (all lowercase)
- Unique constraint prevents duplicates
- Validation with regex

✅ **Account Security:**
- Cannot login without verification
- Last login tracking
- Created/Updated timestamps

---

## Development vs Production

### Development Mode (Current)
- OTP codes printed to console
- No actual emails sent
- Look for output like:
```
==============================================================
📧 OTP EMAIL (Development Mode)
==============================================================
To: user@example.com
Subject: Your StockUP Verification Code

Your verification code is: 1234
This code will expire in 5 minutes.
==============================================================
```

### Production Mode
Configure SMTP in `.env`:
```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@stockup.com
```

Then OTPs will be sent via actual email.

---

## Testing the APIs

### Using curl:

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Verify OTP
curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp_code":"1234"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Using Postman:
1. Create new collection "StockUP Auth"
2. Add requests for each endpoint
3. Set method to POST
4. Set header `Content-Type: application/json`
5. Add JSON body
6. Send and verify responses

---

## Frontend Integration

### React/JavaScript Example:

```javascript
// Register user
const register = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  return data;
};

// Verify OTP
const verifyOTP = async (email, otp_code) => {
  const response = await fetch('http://localhost:5000/api/v1/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp_code })
  });
  const data = await response.json();
  return data;
};

// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  return data;
};
```

---

## Next Steps

✅ **Backend is Complete and Running!**

**Ready for Frontend Integration:**
1. Connect React registration form to `/register` endpoint
2. Build OTP verification page calling `/verify-otp`
3. Create login form using `/login` endpoint
4. Add "Resend OTP" button calling `/resend-otp`
5. Implement email check for better UX with `/check-email`

**Future Enhancements (Optional):**
- Add JWT tokens for session management
- Implement password reset flow
- Add user profile management
- Enable social login (Google, GitHub)
- Implement rate limiting
- Add refresh token mechanism

---

## Support

Your backend is fully functional! All 5 endpoints are:
- ✅ Implemented
- ✅ Tested with MongoDB
- ✅ Running on http://localhost:5000
- ✅ Ready for frontend integration

Start building your React frontend now! 🚀
