# Production Configuration Guide

**Project**: Betancourt Audio Website
**Component**: Django Backend
**Last Updated**: 2025-12-28

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Variables](#environment-variables)
3. [Security Settings](#security-settings)
4. [Performance Optimization](#performance-optimization)
5. [Monitoring & Logging](#monitoring--logging)
6. [Verification Checklist](#verification-checklist)

---

## Overview

This document outlines the production configuration for the Django backend. All production-specific settings are automatically enabled when `DEBUG=False`.

### Configuration Philosophy

- **Environment-driven**: All sensitive configuration via environment variables
- **Secure by default**: Production security settings auto-enabled
- **Fail-safe**: Missing critical variables cause startup errors
- **Documented**: Every setting explained with purpose and best practices

---

## Environment Variables

### Required Production Variables

These **must** be set in production:

```bash
# Security Keys
SECRET_KEY=<50-character-random-string>
JWT_SECRET_KEY=<32-character-random-string>

# Application Settings
DEBUG=False
ALLOWED_HOSTS=betancourtaudio.com,www.betancourtaudio.com,api.betancourtaudio.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
POSTGRES_DB=betancourt_audio_prod
POSTGRES_USER=<secure_username>
POSTGRES_PASSWORD=<strong_password>
POSTGRES_HOST=<db_host_or_rds_endpoint>
POSTGRES_PORT=5432

# Email (Production SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=<sendgrid_api_key>
DEFAULT_FROM_EMAIL=noreply@betancourtaudio.com

# CORS
CORS_ALLOWED_ORIGINS=https://betancourtaudio.com,https://www.betancourtaudio.com

# Frontend URL
FRONTEND_URL=https://betancourtaudio.com
```

### Variable Details

#### SECRET_KEY

**Purpose**: Cryptographic signing for sessions, CSRF tokens, password reset tokens

**Generation**:
```bash
openssl rand -base64 50
```

**Example**:
```
5HnOLJM1AYBhxNd9CsA1FoYsr4dAkCp5oHRWv64d8zyARfRMBPEpAjwHo3X3S3RmrXs=
```

**Security Requirements**:
- ✅ Minimum 50 characters
- ✅ Truly random (not manually typed)
- ✅ Different for each environment (dev, staging, production)
- ✅ Never committed to version control
- ✅ Rotated periodically (invalidates sessions)

#### JWT_SECRET_KEY

**Purpose**: Signing and verifying JWT tokens

**Generation**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Example**:
```
5OVV9pnTd98ECzlGimgVhuIN92pPTpr-AnPd-7nPJZ8
```

**Security Requirements**:
- ✅ Minimum 256 bits (32 bytes)
- ✅ URL-safe characters
- ✅ Different from SECRET_KEY
- ✅ Different for each environment
- ✅ Rotation invalidates all tokens

#### DEBUG

**Purpose**: Enable/disable debug mode

**Values**: `True` (development) or `False` (production)

**Production Value**: `DEBUG=False`

**Critical**: NEVER set `DEBUG=True` in production! This exposes:
- ❌ Detailed error pages with code and variables
- ❌ SQL queries in responses
- ❌ Application internals and file paths
- ❌ Environment variables
- ❌ Security vulnerabilities

#### ALLOWED_HOSTS

**Purpose**: Whitelist of domains that can serve the application

**Format**: Comma-separated list (no spaces)

**Production Example**:
```
ALLOWED_HOSTS=betancourtaudio.com,www.betancourtaudio.com,api.betancourtaudio.com
```

**Security**: Django rejects requests with `Host` header not in this list (prevents host header attacks)

#### Database Variables

**POSTGRES_DB**: Database name
- Production: `betancourt_audio_prod`
- Staging: `betancourt_audio_staging`
- Development: `betancourt_audio`

**POSTGRES_USER**: Database user
- ❌ Not `postgres` (default superuser)
- ✅ Dedicated user with minimal privileges
- ✅ Different credentials per environment

**POSTGRES_PASSWORD**: Database password
- Generate: `openssl rand -base64 32`
- Minimum 16 characters
- Include uppercase, lowercase, numbers, symbols
- Never share between environments

**POSTGRES_HOST**: Database server hostname
- Development: `db` (Docker service name)
- Production: RDS endpoint, Cloud SQL host, or IP address
- Use private networking when possible

**POSTGRES_PORT**: Database port (default: 5432)

**Alternative**: Use `DATABASE_URL` for all-in-one configuration:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

#### Email Variables

**EMAIL_BACKEND**: Email sending backend

Development:
```
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```
- Emails printed to console (no actual sending)

Production:
```
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
```
- Sends emails via SMTP server

**EMAIL_HOST**: SMTP server hostname

Common providers:
- SendGrid: `smtp.sendgrid.net`
- AWS SES: `email-smtp.us-east-1.amazonaws.com`
- Gmail: `smtp.gmail.com` (not recommended for production)
- Mailgun: `smtp.mailgun.org`

**EMAIL_PORT**: SMTP port
- `587` - TLS (recommended)
- `465` - SSL
- `25` - Unencrypted (not recommended)

**EMAIL_USE_TLS**: Enable TLS encryption
- Production: `True`
- Encrypts email transmission

**EMAIL_HOST_USER**: SMTP username
- SendGrid: `apikey` (literal string)
- Others: Actual username or email

**EMAIL_HOST_PASSWORD**: SMTP password
- SendGrid: API key (starts with `SG.`)
- Others: Account password or API key

**DEFAULT_FROM_EMAIL**: Sender email address
- Must be verified with email provider
- Format: `noreply@betancourtaudio.com`
- Appears in "From" field of emails

#### CORS_ALLOWED_ORIGINS

**Purpose**: Whitelist of origins allowed to make cross-origin requests

**Format**: Comma-separated list (no spaces, include protocol)

**Production Example**:
```
CORS_ALLOWED_ORIGINS=https://betancourtaudio.com,https://www.betancourtaudio.com
```

**Security**:
- ✅ Specific origins only (never use wildcard `*`)
- ✅ HTTPS protocol in production
- ✅ Include all frontend domains
- ❌ No `http://` origins in production

#### FRONTEND_URL

**Purpose**: Base URL of frontend application (for email links)

**Format**: Full URL with protocol, no trailing slash

**Production Example**:
```
FRONTEND_URL=https://betancourtaudio.com
```

**Usage**: Constructs password reset links
```
https://betancourtaudio.com/reset-password?token=abc123
```

### Optional Production Variables

These have sensible defaults but can be customized:

```bash
# JWT Token Lifetimes
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=15  # Default: 15 minutes
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7     # Default: 7 days

# Password Requirements
PASSWORD_MIN_LENGTH=8                  # Default: 8 characters
PASSWORD_RESET_TOKEN_EXPIRY_HOURS=1    # Default: 1 hour

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOGIN_RATE_WINDOW_MINUTES=5
LOGIN_BLOCK_DURATION_MINUTES=15
MAX_REGISTRATION_ATTEMPTS=3
REGISTRATION_RATE_WINDOW_HOURS=1
MAX_RESET_ATTEMPTS=3
RESET_RATE_WINDOW_HOURS=1
```

---

## Security Settings

### Automatic Production Security

When `DEBUG=False`, the following security settings are automatically enabled (as of config/settings.py line 220-243):

#### HTTPS/SSL Settings

```python
SECURE_SSL_REDIRECT = True
```
- **Purpose**: Redirect all HTTP requests to HTTPS
- **Effect**: `http://betancourtaudio.com` → `https://betancourtaudio.com`
- **Requirement**: Valid SSL certificate installed

```python
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
```
- **Purpose**: Trust `X-Forwarded-Proto` header from reverse proxy
- **Use Case**: Behind Nginx, AWS ALB, or other load balancer
- **Security**: Only set if behind trusted proxy

#### Cookie Security

```python
SESSION_COOKIE_SECURE = True
```
- **Purpose**: Send session cookie only over HTTPS
- **Protection**: Prevents session hijacking on HTTP connections

```python
CSRF_COOKIE_SECURE = True
```
- **Purpose**: Send CSRF cookie only over HTTPS
- **Protection**: Prevents CSRF token theft

```python
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
```
- **Purpose**: Prevent JavaScript access to cookies
- **Protection**: Prevents XSS-based cookie theft

```python
SESSION_COOKIE_SAMESITE = 'Strict'
CSRF_COOKIE_SAMESITE = 'Strict'
```
- **Purpose**: Restrict cookie sending to same-site requests
- **Protection**: Additional CSRF protection
- **Options**: `Strict`, `Lax`, `None`

#### HSTS (HTTP Strict Transport Security)

```python
SECURE_HSTS_SECONDS = 31536000  # 1 year
```
- **Purpose**: Tell browsers to only use HTTPS for next year
- **Effect**: Browser automatically converts HTTP to HTTPS
- **Warning**: Don't enable until HTTPS is fully working!

```python
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
```
- **Purpose**: Apply HSTS to all subdomains
- **Requirement**: All subdomains must support HTTPS

```python
SECURE_HSTS_PRELOAD = True
```
- **Purpose**: Eligible for browser HSTS preload list
- **Process**: Submit domain to hstspreload.org after enabling
- **Permanence**: Very difficult to undo!

#### Content Security

```python
SECURE_CONTENT_TYPE_NOSNIFF = True
```
- **Purpose**: Prevent MIME type sniffing
- **Protection**: Browser respects `Content-Type` header
- **Header**: `X-Content-Type-Options: nosniff`

```python
SECURE_BROWSER_XSS_FILTER = True
```
- **Purpose**: Enable browser's built-in XSS filter
- **Header**: `X-XSS-Protection: 1; mode=block`
- **Note**: Redundant with modern CSP, but harmless

```python
X_FRAME_OPTIONS = 'DENY'
```
- **Purpose**: Prevent site from being embedded in iframe
- **Protection**: Prevents clickjacking attacks
- **Options**: `DENY`, `SAMEORIGIN`, `ALLOW-FROM uri`

### Password Security

#### Hashing Algorithm

```python
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',  # Primary
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',  # Fallback
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]
```

**Argon2id Configuration** (Django defaults):
- Time cost: 2 iterations
- Memory cost: 102400 KB (100 MB)
- Parallelism: 8 threads
- Salt: 16 bytes (auto-generated)
- Hash length: 32 bytes

**Why Argon2id**:
- ✅ OWASP recommended (2023)
- ✅ Memory-hard (resists GPU/ASIC attacks)
- ✅ Side-channel resistant
- ✅ Winner of Password Hashing Competition (2015)

#### Password Validators

```python
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
```

**Validation Rules**:
1. Not similar to user attributes (email, name)
2. Minimum 8 characters (configurable)
3. Not in list of 20,000+ common passwords
4. Not entirely numeric

### JWT Token Security

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': JWT_SECRET_KEY,
}
```

**Security Considerations**:
- ✅ Short access token lifetime (15 minutes)
- ✅ Separate signing key from Django SECRET_KEY
- ✅ HS256 algorithm (HMAC with SHA-256)
- ⚠️ Future: Enable token blacklist for logout

---

## Performance Optimization

### Database Connection Pooling

**Recommended**: PgBouncer

```bash
# Install PgBouncer
sudo apt install pgbouncer

# Configure (pgbouncer.ini)
[databases]
betancourt_audio_prod = host=localhost port=5432 dbname=betancourt_audio_prod

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

**Django Settings**:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'HOST': 'localhost',
        'PORT': '6432',  # PgBouncer port
    }
}
```

### Static Files

**Development**:
```python
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

**Production**:
1. Collect static files:
   ```bash
   python manage.py collectstatic --noinput
   ```

2. Serve with Nginx:
   ```nginx
   location /static/ {
       alias /var/www/betancourt-website/backend/staticfiles/;
       expires 30d;
       add_header Cache-Control "public, immutable";
   }
   ```

3. Or use CDN (CloudFront, CloudFlare):
   ```python
   STATIC_URL = 'https://cdn.betancourtaudio.com/static/'
   ```

### WSGI Server

**Gunicorn** (recommended):

```bash
pip install gunicorn

# Run with 4 workers (2-4 x CPU cores)
gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --worker-class sync \
  --timeout 120 \
  --max-requests 1000 \
  --max-requests-jitter 100 \
  --access-logfile /var/log/gunicorn/access.log \
  --error-logfile /var/log/gunicorn/error.log \
  --log-level info
```

**Worker Count Calculation**:
```
workers = (2 x CPU_cores) + 1

Examples:
- 2 cores → 5 workers
- 4 cores → 9 workers
- 8 cores → 17 workers
```

### Caching

**Redis** (recommended for session and cache backend):

```python
# Install
pip install redis django-redis

# Settings
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Session storage
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
```

---

## Monitoring & Logging

### Error Tracking

**Sentry** (recommended):

```bash
pip install sentry-sdk
```

```python
# config/settings.py
import sentry_sdk

if not DEBUG:
    sentry_sdk.init(
        dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
        environment="production",
        traces_sample_rate=0.1,  # 10% of transactions
    )
```

### Application Logging

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/django/application.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['file', 'console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': False,
        },
        'authentication': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

### Security Logging

**Failed Login Attempts**:
```python
# authentication/views.py
import logging

logger = logging.getLogger('authentication')

# Log failed logins
if user is None:
    logger.warning(f"Failed login attempt for email: {email} from IP: {request.META.get('REMOTE_ADDR')}")
```

**Monitor**:
- Failed login patterns (potential brute force)
- Password reset requests (potential enumeration)
- Unusual API usage (potential abuse)

---

## Verification Checklist

### Pre-Deployment Checks

#### Environment Variables

- [ ] `SECRET_KEY` set and unique (50+ characters)
  ```bash
  echo $SECRET_KEY | wc -m  # Should be > 50
  ```

- [ ] `JWT_SECRET_KEY` set and unique (different from SECRET_KEY)
  ```bash
  [ "$SECRET_KEY" != "$JWT_SECRET_KEY" ] && echo "Different" || echo "SAME - FIX THIS!"
  ```

- [ ] `DEBUG` set to False
  ```bash
  [ "$DEBUG" = "False" ] && echo "OK" || echo "FIX - Set DEBUG=False"
  ```

- [ ] `ALLOWED_HOSTS` includes production domains
  ```bash
  echo $ALLOWED_HOSTS  # Should include production domain(s)
  ```

- [ ] Database credentials secure and different from development
  ```bash
  [ "$POSTGRES_PASSWORD" != "postgres" ] && echo "OK" || echo "FIX - Change password"
  ```

- [ ] Email SMTP credentials configured (production provider)
  ```bash
  [ "$EMAIL_BACKEND" = "django.core.mail.backends.smtp.EmailBackend" ] && echo "OK" || echo "Check email backend"
  ```

- [ ] CORS origins limited to production domains (HTTPS)
  ```bash
  echo $CORS_ALLOWED_ORIGINS | grep -q "https://" && echo "OK" || echo "FIX - Use HTTPS"
  ```

#### Security Settings

- [ ] Production security settings enabled (check Django admin "Security" panel)
- [ ] SSL certificate valid and not expiring soon
  ```bash
  echo | openssl s_client -servername betancourtaudio.com -connect betancourtaudio.com:443 2>/dev/null | openssl x509 -noout -dates
  ```

- [ ] HTTPS redirect working
  ```bash
  curl -I http://betancourtaudio.com | grep -i "301\|location.*https"
  ```

- [ ] Security headers present
  ```bash
  curl -I https://betancourtaudio.com | grep -i "strict-transport\|x-content\|x-frame"
  ```

#### Application Functionality

- [ ] Database migrations applied
  ```bash
  python manage.py showmigrations | grep -v "\[X\]" && echo "Unapplied migrations!" || echo "All applied"
  ```

- [ ] Static files collected
  ```bash
  ls -l staticfiles/ | wc -l  # Should have files
  ```

- [ ] Admin panel accessible (`/admin/`)
- [ ] API endpoints responding
  ```bash
  curl https://api.betancourtaudio.com/api/auth/ && echo "OK" || echo "ERROR"
  ```

- [ ] Password reset emails sending
- [ ] Registration working
- [ ] Login working

#### Performance

- [ ] Gunicorn running with appropriate worker count
- [ ] Database connection pooling configured (PgBouncer)
- [ ] Static files served efficiently (Nginx or CDN)
- [ ] Caching configured (Redis)

#### Monitoring

- [ ] Error tracking configured (Sentry)
- [ ] Application logging working
- [ ] Failed login attempts logged
- [ ] Uptime monitoring configured
- [ ] Database backups running

### Post-Deployment Verification

#### Security Scan

**SSL Labs**:
```
https://www.ssllabs.com/ssltest/analyze.html?d=betancourtaudio.com
```
- Target: A+ rating

**Security Headers**:
```
https://securityheaders.com/?q=betancourtaudio.com
```
- Target: A rating

**Mozilla Observatory**:
```
https://observatory.mozilla.org/analyze/betancourtaudio.com
```
- Target: A+ rating

#### Functionality Testing

```bash
# Health check
curl https://api.betancourtaudio.com/health

# Register user
curl -X POST https://api.betancourtaudio.com/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!Pass","password_confirm":"Test123!Pass"}'

# Login
curl -X POST https://api.betancourtaudio.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!Pass"}'

# Get profile (with token from login)
curl -X GET https://api.betancourtaudio.com/api/auth/profile/ \
  -H "Authorization: Bearer <access_token>"
```

#### Performance Testing

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API response time (100 requests, 10 concurrent)
ab -n 100 -c 10 https://api.betancourtaudio.com/api/auth/

# Target: < 500ms average response time
```

---

## Troubleshooting

### Common Issues

**Issue**: 500 Internal Server Error

**Diagnosis**:
```bash
# Check Django logs
tail -f /var/log/django/application.log

# Check Gunicorn logs
tail -f /var/log/gunicorn/error.log

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

**Common Causes**:
- Missing environment variable
- Database connection failure
- Static files not collected
- Wrong file permissions

---

**Issue**: HTTPS redirect loop

**Cause**: `SECURE_SSL_REDIRECT=True` but reverse proxy not passing `X-Forwarded-Proto`

**Fix**:
```nginx
# Nginx configuration
proxy_set_header X-Forwarded-Proto $scheme;
```

---

**Issue**: Static files not loading (404)

**Diagnosis**:
```bash
# Check if files collected
ls -la /var/www/betancourt-website/backend/staticfiles/

# Check Nginx configuration
sudo nginx -t
```

**Fix**:
```bash
# Collect static files
python manage.py collectstatic --noinput

# Restart Nginx
sudo systemctl restart nginx
```

---

## Support

**Technical Issues**: dev@betancourtaudio.com
**Security Issues**: security@betancourtaudio.com
**Emergency Hotline**: +57 XXX XXX XXXX

---

**Related Documentation**:
- README.md - Project overview
- backend/authentication/API_DOCUMENTATION.md - API specs
- backend/authentication/SECURITY.md - Security guidelines
- DEPLOYMENT_CHECKLIST.md - Deployment runbook

**Last Review**: 2025-12-28
**Next Review**: 2026-01-28
**Compliance**: OWASP Top 10 2023, Django Security Best Practices
