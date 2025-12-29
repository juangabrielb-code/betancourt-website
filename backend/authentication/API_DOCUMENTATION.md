# Authentication API Documentation

**Version**: 1.0.0
**Base URL**: `http://localhost:8000/api/auth/`
**Production URL**: `https://api.betancourtaudio.com/api/auth/`

---

## Table of Contents

1. [Authentication Overview](#authentication-overview)
2. [API Endpoints](#api-endpoints)
3. [Authentication Flow](#authentication-flow)
4. [Error Handling](#error-handling)
5. [Security Features](#security-features)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

---

## Authentication Overview

This API uses **JWT (JSON Web Tokens)** for stateless authentication. After successful registration or login, clients receive two tokens:

- **Access Token**: Short-lived (15 minutes), used for authenticated requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens

### Token Usage

Include the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

---

## API Endpoints

### 1. Register User

**Endpoint**: `POST /api/auth/register/`
**Permission**: Public (AllowAny)
**Description**: Create a new user account

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",          // Optional
  "last_name": "Doe"              // Optional
}
```

#### Response (201 Created)

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "email_verified": false,
    "is_active": true,
    "date_joined": "2025-12-28T10:30:00Z"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful"
}
```

#### Error Responses

**400 Bad Request** - Validation errors

```json
{
  "email": ["A user with this email already exists."],
  "password": ["This password is too common."]
}
```

#### Password Requirements

- Minimum 8 characters
- Cannot be entirely numeric
- Cannot be too common (Django password validators)
- Cannot be too similar to user information

---

### 2. Login

**Endpoint**: `POST /api/auth/login/`
**Permission**: Public (AllowAny)
**Description**: Authenticate with email and password

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Response (200 OK)

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "email_verified": false,
    "is_active": true,
    "last_login": "2025-12-28T10:30:00Z"
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### Error Responses

**401 Unauthorized** - Invalid credentials

```json
{
  "detail": "Invalid credentials"
}
```

**401 Unauthorized** - Account disabled

```json
{
  "detail": "Account is disabled"
}
```

#### Security Features

- **Anti-enumeration**: Same error message for invalid email or password
- **Timing-safe**: Minimum 500ms response time to prevent timing attacks
- **Rate limiting**: Max 5 attempts per 5-minute window

---

### 3. Forgot Password

**Endpoint**: `POST /api/auth/forgot-password/`
**Permission**: Public (AllowAny)
**Description**: Request password reset token via email

#### Request Body

```json
{
  "email": "user@example.com"
}
```

#### Response (200 OK)

```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

#### Security Features

- **Anti-enumeration**: Same response regardless of email existence
- **Token expiry**: Reset links expire in 1 hour
- **One-time use**: Tokens can only be used once
- **Rate limiting**: Max 3 attempts per 1-hour window

#### Email Content

Users receive an email with:
- Reset password link: `https://betancourtaudio.com/reset-password?token=<token>`
- Expiration notice (1 hour)
- Security warning if they didn't request the reset

---

### 4. Reset Password

**Endpoint**: `POST /api/auth/reset-password/`
**Permission**: Public (AllowAny)
**Description**: Reset password using token from email

#### Request Body

```json
{
  "token": "abc123def456ghi789...",
  "password": "NewSecurePass123!",
  "password_confirm": "NewSecurePass123!"
}
```

#### Response (200 OK)

```json
{
  "message": "Password reset successful"
}
```

#### Error Responses

**400 Bad Request** - Invalid or expired token

```json
{
  "token": ["Token is invalid or has expired."]
}
```

**400 Bad Request** - Password validation errors

```json
{
  "password": ["This password is too common."]
}
```

#### Token Validation

Tokens are rejected if:
- Token doesn't exist in database
- Token has expired (>1 hour old)
- Token has already been used
- Token format is invalid

---

### 5. Change Password

**Endpoint**: `POST /api/auth/change-password/`
**Permission**: Authenticated users only
**Description**: Change password for authenticated user

#### Request Headers

```
Authorization: Bearer <access_token>
```

#### Request Body

```json
{
  "old_password": "OldPass123!",
  "new_password": "NewSecurePass123!",
  "new_password_confirm": "NewSecurePass123!"
}
```

#### Response (200 OK)

```json
{
  "message": "Password changed successfully"
}
```

#### Error Responses

**400 Bad Request** - Incorrect old password

```json
{
  "old_password": ["Incorrect password."]
}
```

**401 Unauthorized** - Missing or invalid token

```json
{
  "detail": "Authentication credentials were not provided."
}
```

#### Security Features

- Requires valid access token
- Verifies old password before allowing change
- Sends notification email after successful change
- New password must meet strength requirements

---

### 6. Get Profile

**Endpoint**: `GET /api/auth/profile/`
**Permission**: Authenticated users only
**Description**: Get current user's profile information

#### Request Headers

```
Authorization: Bearer <access_token>
```

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "email_verified": false,
  "is_active": true,
  "date_joined": "2025-12-28T10:30:00Z",
  "last_login": "2025-12-28T14:45:00Z"
}
```

#### Error Responses

**401 Unauthorized** - Missing or invalid token

```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### 7. Logout

**Endpoint**: `POST /api/auth/logout/`
**Permission**: Authenticated users only
**Description**: Logout user (client-side token deletion)

#### Request Headers

```
Authorization: Bearer <access_token>
```

#### Response (200 OK)

```json
{
  "message": "Logout successful"
}
```

#### Notes

- JWT tokens are stateless, so logout is primarily client-side
- Clients should delete both access and refresh tokens
- Future: Server-side token blacklist may be implemented

---

## Authentication Flow

### Registration Flow

```
1. User submits registration form
   POST /api/auth/register/

2. Backend validates data:
   - Email uniqueness
   - Password strength
   - Password confirmation match

3. Backend creates user:
   - Hashes password with Argon2id
   - Normalizes email (lowercase domain)
   - Sets email_verified = false

4. Backend generates JWT tokens

5. Return user data + tokens

6. Client stores tokens (localStorage/cookie)
```

### Login Flow

```
1. User submits login form
   POST /api/auth/login/

2. Backend authenticates:
   - Timing-safe password comparison
   - Check user.is_active

3. Update last_login timestamp

4. Generate JWT tokens

5. Return user data + tokens

6. Client stores tokens
```

### Password Reset Flow

```
1. User requests password reset
   POST /api/auth/forgot-password/

2. Backend checks if email exists (silently)

3. If exists:
   - Generate cryptographically secure token
   - Store token in database with expiry
   - Send email with reset link

4. Return success message (always, even if email doesn't exist)

5. User clicks link in email
   GET /reset-password?token=<token>

6. User submits new password
   POST /api/auth/reset-password/

7. Backend validates token:
   - Check expiration
   - Check if already used

8. If valid:
   - Hash new password
   - Mark token as used
   - Return success

9. Client redirects to login
```

### Authenticated Request Flow

```
1. Client makes request with access token
   GET /api/auth/profile/
   Authorization: Bearer <access_token>

2. Backend validates JWT token:
   - Signature verification
   - Expiration check
   - User lookup

3. If valid:
   - Process request
   - Return response

4. If expired:
   - Return 401 Unauthorized
   - Client should refresh token
```

### Token Refresh Flow (Future)

```
1. Client detects expired access token

2. Client uses refresh token
   POST /api/auth/token/refresh/
   {"refresh": "<refresh_token>"}

3. Backend validates refresh token

4. If valid:
   - Generate new access token
   - Return new access token

5. Client updates stored access token
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET/POST requests |
| 201 | Created | Successful user registration |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Invalid credentials or missing/expired token |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Endpoint doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format

All error responses follow this structure:

```json
{
  "field_name": ["Error message 1", "Error message 2"],
  "another_field": ["Error message"]
}
```

Or for non-field errors:

```json
{
  "detail": "Error message"
}
```

### Common Error Messages

#### Registration

- `"A user with this email already exists."`
- `"This password is too common."`
- `"This password is too short. It must contain at least 8 characters."`
- `"The password is too similar to the email."`
- `"This password is entirely numeric."`
- `"Passwords do not match."`

#### Login

- `"Invalid credentials"` (email or password incorrect)
- `"Account is disabled"`

#### Password Reset

- `"Token is invalid or has expired."`
- `"Passwords do not match."`

#### Change Password

- `"Incorrect password."` (old password)
- `"Authentication credentials were not provided."`

---

## Security Features

### 1. Password Hashing

- **Algorithm**: Argon2id (OWASP recommended)
- **Configuration**: Django defaults with memory-hard parameters
- **Salt**: Automatically generated per password
- **Never stored in plaintext**

### 2. JWT Tokens

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret Key**: Stored in environment variable
- **Access Token Lifetime**: 15 minutes
- **Refresh Token Lifetime**: 7 days
- **Payload includes**: user_id, exp, iat, jti

### 3. Anti-Enumeration Protection

#### Login Endpoint

- Same error message for invalid email or password
- Constant-time response (minimum 500ms)
- Prevents timing attacks

#### Forgot Password Endpoint

- Same success message regardless of email existence
- Prevents email enumeration
- Doesn't reveal if account exists

### 4. Password Reset Tokens

- **Generation**: `secrets.token_urlsafe(32)` (256-bit security)
- **Expiration**: 1 hour (configurable)
- **One-time use**: Marked as used after successful reset
- **Stored hashed** in database (future enhancement)

### 5. CORS Configuration

- Configured origins: `http://localhost:3000`, `http://frontend:3000`
- Production: Add `https://betancourtaudio.com`
- Credentials allowed for cookie-based auth (if needed)

### 6. HTTPS Enforcement (Production)

- All authentication endpoints require HTTPS in production
- `SECURE_SSL_REDIRECT = True`
- `SESSION_COOKIE_SECURE = True`
- `CSRF_COOKIE_SECURE = True`

---

## Rate Limiting

### Configuration

Rate limiting is configured per endpoint to prevent abuse:

| Endpoint | Limit | Window | Block Duration |
|----------|-------|--------|----------------|
| Login | 5 attempts | 5 minutes | 5 minutes |
| Registration | 3 attempts | 1 hour | 1 hour |
| Forgot Password | 3 attempts | 1 hour | 1 hour |
| Reset Password | 5 attempts | 1 hour | 1 hour |

### Rate Limit Response

**429 Too Many Requests**

```json
{
  "detail": "Too many requests. Please try again later."
}
```

### Implementation

- Uses IP address for anonymous users
- Uses user ID for authenticated users
- Configurable via environment variables:
  - `MAX_LOGIN_ATTEMPTS`
  - `LOGIN_RATE_WINDOW_MINUTES`
  - `LOGIN_BLOCK_DURATION_MINUTES`

---

## Examples

### Example 1: Complete Registration Flow

```bash
# 1. Register new user
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password_confirm": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Response:
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "email_verified": false
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful"
}

# 2. Use access token for authenticated request
ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Response:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "email_verified": false,
  "is_active": true
}
```

### Example 2: Login and Profile Update

```bash
# 1. Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Response includes tokens

# 2. Change password
curl -X POST http://localhost:8000/api/auth/change-password/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "old_password": "SecurePass123!",
    "new_password": "NewSecurePass456!",
    "new_password_confirm": "NewSecurePass456!"
  }'

# Response:
{
  "message": "Password changed successfully"
}
```

### Example 3: Password Reset Flow

```bash
# 1. Request password reset
curl -X POST http://localhost:8000/api/auth/forgot-password/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'

# Response:
{
  "message": "If an account exists with this email, a password reset link has been sent."
}

# 2. User receives email with token and clicks link
# Frontend opens: /reset-password?token=abc123...

# 3. Submit new password with token
curl -X POST http://localhost:8000/api/auth/reset-password/ \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456ghi789...",
    "password": "BrandNewPass789!",
    "password_confirm": "BrandNewPass789!"
  }'

# Response:
{
  "message": "Password reset successful"
}

# 4. Login with new password
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "BrandNewPass789!"
  }'
```

### Example 4: JavaScript/TypeScript Usage

```typescript
// registration.ts
async function registerUser(email: string, password: string) {
  const response = await fetch('http://localhost:8000/api/auth/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      password_confirm: password,
    }),
  });

  if (!response.ok) {
    const errors = await response.json();
    throw new Error(JSON.stringify(errors));
  }

  const data = await response.json();

  // Store tokens
  localStorage.setItem('access_token', data.tokens.access);
  localStorage.setItem('refresh_token', data.tokens.refresh);

  return data.user;
}

// auth.ts
async function authenticatedRequest(url: string, options: RequestInit = {}) {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    // Token expired, handle refresh or redirect to login
    window.location.href = '/login';
  }

  return response;
}

// Usage
const profile = await authenticatedRequest('http://localhost:8000/api/auth/profile/');
const userData = await profile.json();
```

---

## Frontend Integration

### Next.js with Auth.js (NextAuth.js)

Configuration file: `frontend/auth.ts`

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const response = await fetch('http://backend:8000/api/auth/login/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!response.ok) return null;

        const data = await response.json();
        return {
          id: data.user.id,
          email: data.user.email,
          name: `${data.user.first_name} ${data.user.last_name}`,
          accessToken: data.tokens.access,
          refreshToken: data.tokens.refresh,
        };
      },
    }),
  ],
});
```

---

## Deployment Checklist

### Environment Variables

Ensure these are set in production:

```bash
# Django
SECRET_KEY=<generate-with-openssl-rand-base64-50>
DEBUG=False
ALLOWED_HOSTS=api.betancourtaudio.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET_KEY=<generate-strong-random-key>

# Email (Production)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=<sendgrid-api-key>

# CORS
CORS_ALLOWED_ORIGINS=https://betancourtaudio.com

# Frontend
FRONTEND_URL=https://betancourtaudio.com
```

### Security Settings

- [ ] `DEBUG = False`
- [ ] `SECURE_SSL_REDIRECT = True`
- [ ] `SESSION_COOKIE_SECURE = True`
- [ ] `CSRF_COOKIE_SECURE = True`
- [ ] `SECURE_HSTS_SECONDS = 31536000`
- [ ] Strong `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Configure production email provider
- [ ] Enable rate limiting middleware

---

## Support

For questions or issues:
- **Email**: support@betancourtaudio.com
- **Documentation**: https://docs.betancourtaudio.com
- **Status Page**: https://status.betancourtaudio.com

---

**Last Updated**: 2025-12-28
**API Version**: 1.0.0
**Related**: BET-31 (Documentation and Deploy Preparation)
