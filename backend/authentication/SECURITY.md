# Security Documentation

**Project**: Betancourt Audio Website
**Component**: Authentication System
**Last Updated**: 2025-12-28
**Security Review**: Completed

---

## Table of Contents

1. [Overview](#overview)
2. [Password Security](#password-security)
3. [Authentication Tokens](#authentication-tokens)
4. [API Security](#api-security)
5. [Email Security](#email-security)
6. [Production Security Checklist](#production-security-checklist)
7. [Security Testing](#security-testing)
8. [Incident Response](#incident-response)
9. [Security Updates](#security-updates)

---

## Overview

The Betancourt Audio authentication system implements multiple layers of security based on OWASP (Open Web Application Security Project) best practices and industry standards.

### Security Principles

1. **Defense in Depth**: Multiple security layers (password hashing, JWT tokens, rate limiting, HTTPS)
2. **Least Privilege**: Users only access their own data; admins have separate permissions
3. **Fail Securely**: Errors don't reveal sensitive information
4. **Secure by Default**: Development environment uses secure settings
5. **Regular Updates**: Dependencies monitored and updated for security patches

---

## Password Security

### 1. Password Hashing Algorithm

**Algorithm**: Argon2id
**Library**: `argon2-cffi` (version 23.1.0)

#### Why Argon2id?

- **OWASP Recommended**: Current industry best practice for password hashing
- **Memory-Hard**: Resistant to GPU/ASIC cracking attempts
- **Side-Channel Resistant**: Protects against timing attacks
- **Hybrid Approach**: Combines Argon2i (data-independent) and Argon2d (data-dependent)

#### Configuration

Django's default Argon2 configuration (as of Django 5.1):

```python
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',  # Fallback
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',  # Fallback
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',  # Fallback
]
```

**Argon2 Parameters**:
- Time cost: 2 iterations
- Memory cost: 102400 KB (100 MB)
- Parallelism: 8 threads
- Salt: 16 bytes (automatically generated)
- Hash length: 32 bytes

#### Password Storage Format

```
argon2$argon2id$v=19$m=102400,t=2,p=8$<salt>$<hash>
```

**Example**:
```
argon2$argon2id$v=19$m=102400,t=2,p=8$4fG3kL9mN2pQ5rT8wV1xY4zA7bC$
abcdef1234567890abcdef1234567890abcdef1234567890
```

### 2. Password Requirements

Enforced via Django's built-in password validators:

```python
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
        # Prevents passwords similar to user attributes (email, name)
        'OPTIONS': {'max_similarity': 0.7}
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        # Minimum 8 characters (configurable via PASSWORD_MIN_LENGTH env var)
        'OPTIONS': {'min_length': 8}
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
        # Rejects common passwords (from list of 20,000+ common passwords)
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
        # Prevents entirely numeric passwords
    },
]
```

#### Minimum Requirements

- ✅ **Length**: Minimum 8 characters (configurable)
- ✅ **Complexity**: Cannot be entirely numeric
- ✅ **Uniqueness**: Not in common password list
- ✅ **Similarity**: Not too similar to email or name
- ❌ **Special Characters**: Not enforced (avoid complexity requirements that lead to predictable patterns)

#### Recommended Password Patterns

**Good Passwords**:
- `MyDogLovesToRun2024!` (passphrase with number and symbol)
- `Tr0ub4dour&3` (memorable phrase with substitutions)
- `correct-horse-battery-staple` (random word combination)

**Bad Passwords**:
- `password123` (common password)
- `12345678` (entirely numeric)
- `user@example.com` (too similar to email)
- `qwerty` (keyboard pattern)

### 3. Password Reset Security

#### Reset Token Generation

```python
import secrets

token = secrets.token_urlsafe(32)
# Generates 256-bit cryptographically secure token
# Example: "abc123def456ghi789jkl012mno345pqr678stu901vwx234"
```

**Token Properties**:
- **Entropy**: 256 bits of randomness
- **Format**: URL-safe base64 encoding (A-Za-z0-9-_)
- **Length**: Approximately 43 characters
- **Uniqueness**: Virtually impossible to guess or collide

#### Token Storage

```python
class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
```

**Security Measures**:
- ✅ One-time use (marked as `is_used=True` after successful reset)
- ✅ Time-limited (expires after 1 hour by default)
- ✅ User-specific (linked to user account)
- ✅ Cryptographically secure generation
- ⚠️ **Future Enhancement**: Hash tokens before storage (currently stored in plaintext)

#### Token Validation

```python
def is_valid(self):
    """Check if token is valid (not expired and not used)"""
    if self.is_used:
        return False
    if timezone.now() > self.expires_at:
        return False
    return True
```

#### Email Delivery

Reset links sent via email:
- **Development**: Console backend (prints to terminal)
- **Production**: SMTP backend (SendGrid, AWS SES, etc.)

**Email Content**:
- Reset link: `https://betancourtaudio.com/reset-password?token=<token>`
- Expiration notice: "Link expires in 1 hour"
- Security warning: "If you didn't request this, ignore this email"

### 4. Password Change Flow

**Authenticated Password Change**:
1. User provides old password
2. System verifies old password (timing-safe comparison)
3. User provides new password (validated against requirements)
4. System hashes new password with Argon2id
5. Password updated in database
6. Notification email sent to user

**Security Notification Email**:
- Sent after every successful password change
- Alerts user to potential unauthorized access
- Includes timestamp and IP address (future enhancement)

---

## Authentication Tokens

### 1. JWT (JSON Web Tokens)

**Library**: `djangorestframework-simplejwt` (version 5.4.0)
**Algorithm**: HS256 (HMAC with SHA-256)

#### Token Types

**Access Token**:
- **Lifetime**: 15 minutes (configurable via `JWT_ACCESS_TOKEN_LIFETIME_MINUTES`)
- **Purpose**: Authenticate API requests
- **Storage**: Client-side (localStorage or memory)
- **Refresh**: Use refresh token to get new access token

**Refresh Token**:
- **Lifetime**: 7 days (configurable via `JWT_REFRESH_TOKEN_LIFETIME_DAYS`)
- **Purpose**: Obtain new access tokens without re-authenticating
- **Storage**: Client-side (httpOnly cookie recommended)
- **Revocation**: Future enhancement - token blacklist

#### Token Structure

JWT tokens consist of 3 parts separated by dots (`.`):

```
<header>.<payload>.<signature>
```

**Example**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VyX2lkIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwiZXhwIjoxNzM1MjAwMDAwLCJpYXQiOjE3MzUxOTkxMDAsImp0aSI6ImFiYzEyMyJ9.
signature_here
```

**Decoded Payload**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "exp": 1735200000,  // Expiration timestamp
  "iat": 1735199100,  // Issued at timestamp
  "jti": "abc123"     // JWT ID (unique identifier)
}
```

#### Token Configuration

```python
# config/settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,  # Future: Enable token rotation
    'BLACKLIST_AFTER_ROTATION': False,  # Future: Enable blacklist
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': config('JWT_SECRET_KEY'),
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}
```

#### Token Usage

**Client-Side**:
```javascript
// Login and store tokens
const response = await fetch('/api/auth/login/', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
const { tokens } = await response.json();

localStorage.setItem('access_token', tokens.access);
localStorage.setItem('refresh_token', tokens.refresh);

// Use access token for authenticated requests
fetch('/api/auth/profile/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
```

**Server-Side Verification**:
1. Extract token from `Authorization: Bearer <token>` header
2. Verify signature using `JWT_SECRET_KEY`
3. Check expiration (`exp` claim)
4. Extract user ID from `user_id` claim
5. Load user from database
6. Proceed with request

### 2. Secret Key Management

**Django SECRET_KEY**:
- Used for: Cryptographic signing, session security, password reset tokens
- Generation: `openssl rand -base64 50`
- Storage: Environment variable (`.env` file, never committed to git)
- Rotation: Change periodically in production (invalidates existing sessions)

**JWT_SECRET_KEY**:
- Used for: JWT token signing and verification
- Generation: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- Storage: Environment variable (`.env` file, never committed to git)
- Rotation: Change periodically in production (invalidates existing tokens)

**Production Requirements**:
```bash
# Generate new keys for production
openssl rand -base64 50  # Django SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"  # JWT_SECRET_KEY
```

⚠️ **CRITICAL**: Never use the same secret keys in development and production!

---

## API Security

### 1. Anti-Enumeration Protection

Prevents attackers from discovering valid user accounts.

#### Login Endpoint

**Generic Error Messages**:
```json
{
  "detail": "Invalid credentials"
}
```

- Same error for invalid email or password
- Doesn't reveal if email exists in database
- Prevents user enumeration

**Timing-Safe Response**:
```python
start_time = time.time()

# Authenticate user
user = authenticate(request, email=email, password=password)

if user is None:
    elapsed = time.time() - start_time
    if elapsed < 0.5:  # Minimum 500ms response time
        time.sleep(0.5 - elapsed)
    return Response({'detail': 'Invalid credentials'}, status=401)
```

- Minimum 500ms response time for all login attempts
- Prevents timing attacks (measuring response time to determine if email exists)
- Response time difference < 100ms between valid/invalid emails

#### Forgot Password Endpoint

**Always Returns Success**:
```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

- Same message regardless of email existence
- Doesn't reveal if account exists
- Prevents email enumeration

**Backend Logic**:
```python
try:
    user = User.objects.get(email=email)
    # Create reset token and send email
    reset_token = PasswordResetToken.create_token(user)
    send_password_reset_email(user, reset_token.token)
except User.DoesNotExist:
    # Silently ignore - don't reveal that user doesn't exist
    pass

# Always return success message
return Response({'message': '...'}, status=200)
```

### 2. Rate Limiting

Prevents brute-force attacks and API abuse.

#### Configuration

```python
# .env
MAX_LOGIN_ATTEMPTS=5
LOGIN_RATE_WINDOW_MINUTES=5
LOGIN_BLOCK_DURATION_MINUTES=5

MAX_REGISTRATION_ATTEMPTS=3
REGISTRATION_RATE_WINDOW_HOURS=1

MAX_RESET_ATTEMPTS=3
RESET_RATE_WINDOW_HOURS=1
```

#### Limits Per Endpoint

| Endpoint | Limit | Window | Block Duration |
|----------|-------|--------|----------------|
| `/login/` | 5 attempts | 5 minutes | 5 minutes |
| `/register/` | 3 attempts | 1 hour | 1 hour |
| `/forgot-password/` | 3 attempts | 1 hour | 1 hour |
| `/reset-password/` | 5 attempts | 1 hour | 1 hour |

#### Implementation Status

⚠️ **Current**: Rate limiting configured but middleware not yet enabled
✅ **Future**: Enable `django-ratelimit` middleware in production

### 3. CORS (Cross-Origin Resource Sharing)

Controls which origins can access the API.

```python
# config/settings.py
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://frontend:3000'
).split(',')

# Production example:
# CORS_ALLOWED_ORIGINS=https://betancourtaudio.com,https://www.betancourtaudio.com
```

**Security Considerations**:
- ✅ Whitelist specific origins (never use `CORS_ALLOW_ALL_ORIGINS = True` in production)
- ✅ Include credentials for cookie-based auth (if needed)
- ✅ Update for production domain

### 4. HTTPS Enforcement

**Production Settings** (backend/config/settings.py):

```python
if not DEBUG:
    # Force HTTPS
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

    # Secure cookies
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    # HSTS (HTTP Strict Transport Security)
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
```

⚠️ **CRITICAL**: Never set `DEBUG=True` in production!

### 5. Input Validation

All user inputs are validated via Django REST Framework serializers.

**Example - Registration Serializer**:
```python
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs
```

**Validation Checks**:
- ✅ Email format (RFC 5322 compliant)
- ✅ Email uniqueness
- ✅ Password strength (Django validators)
- ✅ Password confirmation match
- ✅ Required fields present
- ✅ Field length limits
- ✅ Data type validation

---

## Email Security

### 1. Email Service Configuration

**Development** (Console Backend):
```python
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
```
- Emails printed to console (no actual sending)
- Safe for testing without risking accidental sends

**Production** (SMTP Backend):
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'apikey'
EMAIL_HOST_PASSWORD = '<sendgrid-api-key>'
DEFAULT_FROM_EMAIL = 'noreply@betancourtaudio.com'
```

### 2. Email Template Security

**HTML Email Templates**:
- All user data escaped to prevent XSS
- Django template auto-escaping enabled
- URL parameters properly encoded

**Example**:
```django
<!-- backend/authentication/templates/emails/password_reset.html -->
<p>Hi{% if user.first_name %} {{ user.first_name }}{% endif %},</p>
<p>Your account: <strong>{{ user.email }}</strong></p>
<a href="{{ reset_url }}">Reset Password</a>
```

**Variables**:
- `{{ user.first_name }}` - Auto-escaped
- `{{ user.email }}` - Auto-escaped
- `{{ reset_url }}` - Properly constructed URL

### 3. Email Sending with Retry Logic

```python
def send_password_reset_email(user, token: str, retry_count: int = 3) -> bool:
    for attempt in range(retry_count):
        try:
            # Send email
            email.send(fail_silently=False)
            return True
        except Exception as e:
            if attempt < retry_count - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                time.sleep(wait_time)
            else:
                # Log error
                logger.error(f"Failed to send password reset email: {e}")
                return False
    return False
```

**Features**:
- Exponential backoff (1s, 2s, 4s)
- Maximum 3 retry attempts
- Error logging for debugging
- Boolean return for success/failure tracking

### 4. Email Security Best Practices

✅ **SPF (Sender Policy Framework)**: Configure DNS to authorize email senders
✅ **DKIM (DomainKeys Identified Mail)**: Sign emails with cryptographic signatures
✅ **DMARC (Domain-based Message Authentication)**: Policy for handling failed auth
✅ **TLS Encryption**: Use `EMAIL_USE_TLS = True` for encrypted connections
✅ **Unsubscribe Headers**: Include for marketing emails (not transactional)

---

## Production Security Checklist

### Pre-Deployment

- [ ] **Django Settings**
  - [ ] `DEBUG = False`
  - [ ] Strong `SECRET_KEY` (50+ characters, randomly generated)
  - [ ] Strong `JWT_SECRET_KEY` (256-bit entropy)
  - [ ] `ALLOWED_HOSTS` configured for production domain
  - [ ] `SECURE_SSL_REDIRECT = True`
  - [ ] `SESSION_COOKIE_SECURE = True`
  - [ ] `CSRF_COOKIE_SECURE = True`
  - [ ] `SECURE_HSTS_SECONDS = 31536000`

- [ ] **Database**
  - [ ] PostgreSQL with strong password
  - [ ] Database backups configured
  - [ ] Connection limited to backend container/server only
  - [ ] SSL/TLS connections enabled

- [ ] **Email Configuration**
  - [ ] Production SMTP provider configured (SendGrid, AWS SES, etc.)
  - [ ] `DEFAULT_FROM_EMAIL` set to real email address
  - [ ] SPF, DKIM, DMARC records configured
  - [ ] Email sending tested and working

- [ ] **CORS Configuration**
  - [ ] `CORS_ALLOWED_ORIGINS` limited to production domain(s)
  - [ ] No `CORS_ALLOW_ALL_ORIGINS = True`
  - [ ] Credentials properly configured

- [ ] **Rate Limiting**
  - [ ] `django-ratelimit` middleware enabled
  - [ ] Rate limits appropriate for traffic patterns
  - [ ] Redis/Memcached configured for distributed rate limiting

- [ ] **Secrets Management**
  - [ ] All secrets in environment variables (not code)
  - [ ] `.env` file not committed to git
  - [ ] Different secrets for dev/staging/production
  - [ ] Secrets rotated regularly

- [ ] **Dependencies**
  - [ ] All packages up to date
  - [ ] No known security vulnerabilities (`pip-audit`)
  - [ ] Dependency pinning in `requirements.txt`

### Post-Deployment

- [ ] **Monitoring**
  - [ ] Error logging configured (Sentry, CloudWatch, etc.)
  - [ ] Failed login attempts monitored
  - [ ] Unusual activity alerts set up
  - [ ] Uptime monitoring enabled

- [ ] **Backups**
  - [ ] Database backups running daily
  - [ ] Backup retention policy defined
  - [ ] Backup restoration tested

- [ ] **SSL/TLS**
  - [ ] Valid SSL certificate installed
  - [ ] Certificate auto-renewal configured (Let's Encrypt)
  - [ ] HTTPS redirect working
  - [ ] Mixed content warnings resolved

- [ ] **Security Testing**
  - [ ] Penetration testing completed
  - [ ] Vulnerability scanning passed
  - [ ] OWASP Top 10 reviewed
  - [ ] Security headers verified (securityheaders.com)

- [ ] **Compliance**
  - [ ] Privacy policy published
  - [ ] Terms of service published
  - [ ] GDPR compliance (if applicable)
  - [ ] Data retention policies defined

---

## Security Testing

### Automated Tests

**Test Suite**: 28 tests in `backend/authentication/tests.py`

**Coverage**:
- ✅ Password hashing (Argon2id verification)
- ✅ JWT token generation and format
- ✅ Password reset token security
- ✅ Anti-enumeration (timing attacks)
- ✅ Input validation
- ✅ Authentication flows

**Run Tests**:
```bash
docker exec betancourt-audio-backend python manage.py test authentication
```

### Manual Security Testing

**Password Hashing**:
```python
# Django shell
docker exec -it betancourt-audio-backend python manage.py shell

from authentication.models import User
user = User.objects.create_user(email='test@example.com', password='TestPass123')
print(user.password)
# Should output: argon2$argon2id$v=19$m=102400,t=2,p=8$...

user.check_password('TestPass123')  # True
user.check_password('WrongPass')    # False
```

**JWT Token Verification**:
```bash
# Login and get token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use token (should work)
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer <valid_token>"

# Use invalid token (should fail with 401)
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer invalid_token"
```

**Rate Limiting** (when enabled):
```bash
# Attempt 6 failed logins in a row
for i in {1..6}; do
  curl -X POST http://localhost:8000/api/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"wrong"}'
done
# 6th attempt should return 429 Too Many Requests
```

### Security Scanning

**Dependency Vulnerabilities**:
```bash
pip install pip-audit
pip-audit
```

**Static Analysis**:
```bash
pip install bandit
bandit -r backend/
```

**OWASP ZAP** (Zed Attack Proxy):
- Automated security testing
- SQL injection detection
- XSS vulnerability scanning
- CSRF token validation

---

## Incident Response

### Security Incident Procedure

1. **Detect**: Monitor logs, user reports, automated alerts
2. **Assess**: Determine severity and scope
3. **Contain**: Limit damage (disable compromised accounts, revoke tokens)
4. **Investigate**: Identify root cause
5. **Remediate**: Fix vulnerability
6. **Communicate**: Notify affected users (if data breach)
7. **Document**: Post-mortem report
8. **Prevent**: Update security measures

### Common Incidents

**Compromised User Account**:
1. Reset user password
2. Invalidate all user tokens (token blacklist)
3. Review login history for suspicious activity
4. Notify user via email
5. Check for data exfiltration

**Secret Key Leak**:
1. Immediately rotate `SECRET_KEY` and `JWT_SECRET_KEY`
2. Force logout all users (invalidate all tokens)
3. Review access logs for unauthorized access
4. Notify security team
5. Investigate how leak occurred

**Brute Force Attack**:
1. Review rate limiting configuration
2. Block attacking IP addresses (firewall/WAF)
3. Increase rate limits temporarily if false positive
4. Monitor for distributed attacks
5. Consider CAPTCHA for login page

---

## Security Updates

### Update Schedule

**Critical Security Patches**: Immediate
**High-Priority Updates**: Within 1 week
**Regular Updates**: Monthly
**Dependency Audits**: Weekly

### Monitoring Resources

- **Django Security**: https://www.djangoproject.com/weblog/
- **Python Security**: https://python.org/news/security/
- **OWASP**: https://owasp.org/
- **CVE Database**: https://cve.mitre.org/

### Update Procedure

1. **Review**: Check release notes for security fixes
2. **Test**: Update in development/staging first
3. **Backup**: Create database backup before production update
4. **Deploy**: Apply updates during low-traffic window
5. **Verify**: Run security tests post-deployment
6. **Monitor**: Watch error logs for issues

---

## Contact

**Security Team**: security@betancourtaudio.com

**Responsible Disclosure**:
If you discover a security vulnerability, please email us directly instead of creating a public GitHub issue. We'll acknowledge receipt within 48 hours and provide a timeline for fixes.

---

**Last Security Review**: 2025-12-28
**Next Scheduled Review**: 2026-01-28
**Related**: BET-30 (Testing & Security Validation), BET-31 (Documentation)
