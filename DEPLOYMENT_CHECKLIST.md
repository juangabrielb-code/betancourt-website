# Deployment Checklist

**Project**: Betancourt Audio Website
**Version**: 1.0.0
**Last Updated**: 2025-12-28

---

## Table of Contents

1. [Pre-Deployment](#pre-deployment)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [Post-Deployment](#post-deployment)
7. [Rollback Plan](#rollback-plan)

---

## Pre-Deployment

### Code Review & Testing

- [ ] All tests passing (backend: 28/28 tests)
  ```bash
  docker exec betancourt-audio-backend python manage.py test authentication
  ```
- [ ] Frontend build successful
  ```bash
  cd frontend && npm run build
  ```
- [ ] Code reviewed and approved
- [ ] Git branch merged to `main`
- [ ] Version tagged in git
  ```bash
  git tag -a v1.0.0 -m "Release v1.0.0"
  git push origin v1.0.0
  ```

### Security Audit

- [ ] No secrets in code (checked with `git secrets` or similar)
- [ ] All dependencies up to date
  ```bash
  pip list --outdated
  npm outdated
  ```
- [ ] Security vulnerabilities addressed
  ```bash
  pip-audit
  npm audit fix
  ```
- [ ] Security.md reviewed and compliance verified
- [ ] Rate limiting configuration verified

### Documentation

- [ ] README.md updated with production setup instructions
- [ ] API documentation complete (`backend/authentication/API_DOCUMENTATION.md`)
- [ ] Security documentation complete (`backend/authentication/SECURITY.md`)
- [ ] Deployment runbook created (this document)
- [ ] Architecture diagrams updated (if applicable)

### Backups

- [ ] Current production database backed up (if updating existing deployment)
- [ ] Backup restoration tested
- [ ] Rollback plan documented

---

## Infrastructure Setup

### Server/Cloud Provider

Choose your deployment platform:

#### Option A: Cloud Platform (Recommended)

**AWS**:
- [ ] EC2 instances provisioned (t3.medium or larger)
- [ ] RDS PostgreSQL instance created (db.t3.micro for dev, db.t3.medium+ for production)
- [ ] Security groups configured (ports 80, 443, 5432)
- [ ] Elastic Load Balancer configured (if multi-instance)
- [ ] S3 bucket for static files and media
- [ ] CloudFront CDN configured
- [ ] Route 53 DNS configured

**Google Cloud Platform**:
- [ ] Compute Engine VM instances
- [ ] Cloud SQL PostgreSQL instance
- [ ] Load Balancer configured
- [ ] Cloud Storage for static files
- [ ] Cloud CDN configured
- [ ] Cloud DNS configured

**DigitalOcean**:
- [ ] Droplets created (4GB RAM minimum)
- [ ] Managed PostgreSQL database
- [ ] Spaces for static files
- [ ] Load Balancer (if needed)
- [ ] DNS configured

#### Option B: VPS Provider

**Providers**: Linode, Vultr, Hetzner

- [ ] VPS instance created (4GB RAM, 2 CPU minimum)
- [ ] PostgreSQL installed or managed database provisioned
- [ ] Firewall configured (UFW or iptables)
- [ ] DNS A/AAAA records configured
- [ ] Backup snapshots enabled

#### Option C: Container Platform

**Docker Swarm**:
- [ ] Swarm cluster initialized
- [ ] Worker nodes joined
- [ ] Overlay network created
- [ ] Secrets configured

**Kubernetes**:
- [ ] Cluster provisioned (EKS, GKE, or self-managed)
- [ ] Namespaces created
- [ ] ConfigMaps and Secrets configured
- [ ] Ingress controller installed (Nginx, Traefik)
- [ ] Persistent volumes configured

### SSL/TLS Certificates

- [ ] Domain name registered and verified
- [ ] SSL certificate obtained

  **Option 1: Let's Encrypt** (Free, recommended)
  ```bash
  sudo certbot --nginx -d betancourtaudio.com -d www.betancourtaudio.com
  ```

  **Option 2: Commercial CA** (Paid)
  - [ ] Certificate purchased (DigiCert, GlobalSign, etc.)
  - [ ] CSR generated
  - [ ] Certificate installed

- [ ] Certificate auto-renewal configured
- [ ] HTTPS redirect enabled
- [ ] Mixed content warnings resolved

### Reverse Proxy / Load Balancer

**Nginx** (recommended):
- [ ] Nginx installed
- [ ] Configuration file created
  ```nginx
  server {
      listen 80;
      server_name betancourtaudio.com www.betancourtaudio.com;
      return 301 https://$server_name$request_uri;
  }

  server {
      listen 443 ssl http2;
      server_name betancourtaudio.com www.betancourtaudio.com;

      ssl_certificate /etc/letsencrypt/live/betancourtaudio.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/betancourtaudio.com/privkey.pem;

      # Backend API
      location /api/ {
          proxy_pass http://backend:8000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }

      # Frontend
      location / {
          proxy_pass http://frontend:3000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```
- [ ] SSL/TLS configuration hardened
- [ ] Gzip compression enabled
- [ ] Security headers configured
- [ ] Rate limiting configured (if not using application-level)

**Traefik**:
- [ ] Traefik installed
- [ ] Dynamic configuration set up
- [ ] Let's Encrypt integration configured
- [ ] Middlewares configured (security headers, rate limiting)

---

## Environment Configuration

### Backend Environment Variables

Create production `.env` file in `backend/` directory:

```bash
# Django Core Settings
SECRET_KEY=<GENERATE_NEW_50_CHAR_KEY>  # CRITICAL: Must be unique for production!
DEBUG=False  # CRITICAL: Never set to True in production!
ALLOWED_HOSTS=betancourtaudio.com,www.betancourtaudio.com,api.betancourtaudio.com

# Database Configuration
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname>
POSTGRES_DB=betancourt_audio_prod
POSTGRES_USER=<secure_username>
POSTGRES_PASSWORD=<strong_password>  # Generate with: openssl rand -base64 32
POSTGRES_HOST=<rds_endpoint_or_db_host>
POSTGRES_PORT=5432

# JWT Configuration
JWT_SECRET_KEY=<GENERATE_NEW_JWT_KEY>  # python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=15
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# Email Configuration (Production SMTP)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=<sendgrid_api_key>
DEFAULT_FROM_EMAIL=noreply@betancourtaudio.com

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://betancourtaudio.com,https://www.betancourtaudio.com

# Frontend URL
FRONTEND_URL=https://betancourtaudio.com

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
LOGIN_RATE_WINDOW_MINUTES=5
LOGIN_BLOCK_DURATION_MINUTES=15
MAX_REGISTRATION_ATTEMPTS=3
REGISTRATION_RATE_WINDOW_HOURS=1
MAX_RESET_ATTEMPTS=3
RESET_RATE_WINDOW_HOURS=1

# Security Settings (enforced in settings.py when DEBUG=False)
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
```

**Environment Variables Checklist**:

- [ ] `SECRET_KEY` - New, unique, 50+ characters
  ```bash
  openssl rand -base64 50
  ```
- [ ] `DEBUG` - Set to `False`
- [ ] `ALLOWED_HOSTS` - Production domains only
- [ ] `DATABASE_URL` - Production database credentials
- [ ] `JWT_SECRET_KEY` - New, unique, 256-bit
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- [ ] `EMAIL_HOST_PASSWORD` - Production SMTP credentials
- [ ] `CORS_ALLOWED_ORIGINS` - Production domains only
- [ ] `FRONTEND_URL` - Production frontend URL
- [ ] All rate limiting variables configured

### Frontend Environment Variables

Create production `.env.local` file in `frontend/` directory:

```bash
# API Base URL
NEXT_PUBLIC_API_URL=https://api.betancourtaudio.com

# Payment Providers (Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_BOLD_PUBLIC_KEY=<bold_production_key>
BOLD_SECRET_KEY=<bold_secret>

# Optional Services
RESEND_API_KEY=re_...  # For transactional emails from frontend
```

**Frontend Variables Checklist**:

- [ ] `NEXT_PUBLIC_API_URL` - Production backend API URL
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Live Stripe key (starts with `pk_live_`)
- [ ] `STRIPE_SECRET_KEY` - Live Stripe secret (starts with `sk_live_`)
- [ ] `NEXT_PUBLIC_BOLD_PUBLIC_KEY` - Production Bold key
- [ ] `BOLD_SECRET_KEY` - Production Bold secret
- [ ] Test payment flow with live keys before go-live

### Docker Environment

If deploying with Docker Compose in production:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:17-alpine
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    env_file:
      - ./backend/.env
    depends_on:
      - db
    networks:
      - backend
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    restart: always
    env_file:
      - ./frontend/.env.local
    depends_on:
      - backend
    networks:
      - backend

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static_files:/static
    depends_on:
      - backend
      - frontend
    networks:
      - backend

volumes:
  postgres_data:
  static_files:

networks:
  backend:
```

- [ ] Production Docker Compose file created
- [ ] Environment variables externalized
- [ ] Restart policies set to `always`
- [ ] Volumes configured for persistence
- [ ] Production Dockerfiles created (multi-stage builds)

---

## Database Setup

### Database Creation

**Managed Database** (RDS, Cloud SQL, etc.):
- [ ] Database instance created
- [ ] PostgreSQL version 17 (or latest stable)
- [ ] Instance size appropriate for traffic (start with db.t3.medium)
- [ ] Automated backups enabled (daily, 7-day retention)
- [ ] Multi-AZ deployment (for high availability)
- [ ] Connection security configured (SSL/TLS required)
- [ ] Database credentials securely stored

**Self-Hosted PostgreSQL**:
- [ ] PostgreSQL 17 installed
- [ ] Authentication configured (pg_hba.conf)
- [ ] Firewall rules restrict access to backend only
- [ ] Backup script created and tested
- [ ] Backup cron job configured
- [ ] Connection pooling configured (PgBouncer recommended)

### Database Migrations

- [ ] Backup existing database (if applicable)
- [ ] Run migrations on production database
  ```bash
  docker exec betancourt-audio-backend python manage.py migrate
  ```
- [ ] Verify migration status
  ```bash
  docker exec betancourt-audio-backend python manage.py showmigrations
  ```
- [ ] Create admin superuser (if first deployment)
  ```bash
  docker exec -it betancourt-audio-backend python manage.py createsuperuser
  ```

### Static Files Collection

- [ ] Collect static files for Django admin
  ```bash
  docker exec betancourt-audio-backend python manage.py collectstatic --noinput
  ```
- [ ] Verify static files served correctly
- [ ] Configure CDN for static files (optional but recommended)

---

## Application Deployment

### Deployment Methods

Choose your deployment method:

#### Method 1: Docker Compose

```bash
# 1. Pull latest code
git pull origin main

# 2. Build production images
docker compose -f docker-compose.prod.yml build

# 3. Start services
docker compose -f docker-compose.prod.yml up -d

# 4. Run migrations
docker exec betancourt-audio-backend python manage.py migrate

# 5. Collect static files
docker exec betancourt-audio-backend python manage.py collectstatic --noinput

# 6. Verify services
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

**Checklist**:
- [ ] Latest code pulled
- [ ] Images built successfully
- [ ] All services started
- [ ] Migrations applied
- [ ] Static files collected
- [ ] Services healthy (check logs)

#### Method 2: Kubernetes

```bash
# 1. Build and push images to registry
docker build -t betancourtaudio/backend:v1.0.0 ./backend
docker build -t betancourtaudio/frontend:v1.0.0 ./frontend
docker push betancourtaudio/backend:v1.0.0
docker push betancourtaudio/frontend:v1.0.0

# 2. Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/database.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml

# 3. Run migrations (init job)
kubectl apply -f k8s/migration-job.yaml
kubectl wait --for=condition=complete job/django-migrate

# 4. Verify deployment
kubectl get pods -n betancourt-audio
kubectl logs -f deployment/backend -n betancourt-audio
```

**Checklist**:
- [ ] Container images built and pushed
- [ ] Namespace created
- [ ] ConfigMaps applied
- [ ] Secrets configured
- [ ] Database deployed
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Ingress configured
- [ ] Migrations completed
- [ ] All pods running

#### Method 3: Traditional VPS

```bash
# 1. SSH into server
ssh user@server.betancourtaudio.com

# 2. Pull latest code
cd /var/www/betancourt-website
git pull origin main

# 3. Backend deployment
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart betancourt-backend

# 4. Frontend deployment
cd ../frontend
npm install
npm run build
sudo systemctl restart betancourt-frontend

# 5. Reload Nginx
sudo nginx -t
sudo systemctl reload nginx

# 6. Verify services
sudo systemctl status betancourt-backend
sudo systemctl status betancourt-frontend
sudo systemctl status nginx
```

**Checklist**:
- [ ] Latest code pulled
- [ ] Dependencies installed (backend and frontend)
- [ ] Migrations applied
- [ ] Static files collected
- [ ] Backend service restarted
- [ ] Frontend service restarted
- [ ] Nginx configuration reloaded
- [ ] All services running

### WSGI Server Configuration

**Gunicorn** (recommended for Django):

```bash
# backend/gunicorn.conf.py
bind = "0.0.0.0:8000"
workers = 4  # 2-4 x CPU cores
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 100
preload_app = True
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "info"
```

- [ ] Gunicorn installed (`pip install gunicorn`)
- [ ] Configuration file created
- [ ] Worker count set (2-4 x CPU cores)
- [ ] Logging configured
- [ ] Service file created (systemd or Docker)
- [ ] Service started and enabled

**uWSGI** (alternative):

```ini
# backend/uwsgi.ini
[uwsgi]
module = config.wsgi:application
master = true
processes = 4
threads = 2
socket = /tmp/betancourt-backend.sock
chmod-socket = 666
vacuum = true
die-on-term = true
```

---

## Post-Deployment

### Verification Tests

#### Backend API Tests

- [ ] Health check endpoint responds
  ```bash
  curl https://api.betancourtaudio.com/api/auth/
  ```
- [ ] Registration works
  ```bash
  curl -X POST https://api.betancourtaudio.com/api/auth/register/ \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test123!","password_confirm":"Test123!"}'
  ```
- [ ] Login works and returns JWT tokens
  ```bash
  curl -X POST https://api.betancourtaudio.com/api/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"Test123!"}'
  ```
- [ ] Authenticated endpoint works
  ```bash
  curl -X GET https://api.betancourtaudio.com/api/auth/profile/ \
    -H "Authorization: Bearer <access_token>"
  ```
- [ ] Password reset flow works
- [ ] Email sending works (check inbox or logs)

#### Frontend Tests

- [ ] Homepage loads (`https://betancourtaudio.com`)
- [ ] Registration page works
- [ ] Login page works
- [ ] Dashboard accessible after login
- [ ] Static assets load (images, CSS, JS)
- [ ] No console errors in browser dev tools
- [ ] Mobile responsive design works
- [ ] Theme toggle works (dark/light mode)
- [ ] Language toggle works (EN/ES)
- [ ] Currency toggle works (USD/COP)

#### Security Tests

- [ ] HTTPS redirect works (http → https)
- [ ] SSL certificate valid (check with browser)
- [ ] Security headers present
  ```bash
  curl -I https://betancourtaudio.com | grep -i "strict-transport\|x-frame\|x-content"
  ```
- [ ] CORS configured correctly (only allowed origins)
- [ ] Rate limiting works (test with multiple failed logins)
- [ ] SQL injection prevented (test with payloads)
- [ ] XSS prevented (test with script tags in inputs)
- [ ] CSRF protection enabled

#### Performance Tests

- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Database queries optimized (check with Django Debug Toolbar in staging)
- [ ] Images optimized and lazy-loaded
- [ ] Lighthouse score > 90
  ```bash
  npm install -g lighthouse
  lighthouse https://betancourtaudio.com --view
  ```

### Monitoring Setup

#### Application Monitoring

**Sentry** (Error Tracking):
- [ ] Sentry project created
- [ ] Django integration configured
  ```python
  # backend/config/settings.py
  import sentry_sdk
  sentry_sdk.init(dsn="https://...", environment="production")
  ```
- [ ] Frontend integration configured
  ```javascript
  // frontend/sentry.config.js
  Sentry.init({ dsn: "https://...", environment: "production" });
  ```
- [ ] Test error sent and received
- [ ] Alert rules configured

**Logging**:
- [ ] Django logging configured
  ```python
  LOGGING = {
      'version': 1,
      'handlers': {'file': {'class': 'logging.FileHandler', 'filename': '/var/log/django/debug.log'}},
      'root': {'handlers': ['file'], 'level': 'INFO'},
  }
  ```
- [ ] Log rotation configured (logrotate)
- [ ] Centralized logging set up (CloudWatch, Datadog, etc.)

#### Infrastructure Monitoring

**Uptime Monitoring**:
- [ ] Uptime monitor configured (UptimeRobot, Pingdom, etc.)
- [ ] Alerts sent to email/Slack on downtime
- [ ] Monitoring interval: 1-5 minutes

**Server Monitoring**:
- [ ] CPU usage monitored
- [ ] RAM usage monitored
- [ ] Disk usage monitored
- [ ] Network traffic monitored
- [ ] Alerts configured for thresholds
- [ ] Tools: Prometheus + Grafana, CloudWatch, Datadog

**Database Monitoring**:
- [ ] Connection pool usage monitored
- [ ] Query performance tracked
- [ ] Slow query log enabled
- [ ] Database size tracked
- [ ] Backup success/failure monitored

### Backups

- [ ] Database backups running automatically (daily)
- [ ] Backup retention policy: 7 daily, 4 weekly, 12 monthly
- [ ] Backup restoration tested successfully
- [ ] Static files backed up (if not on CDN)
- [ ] Environment variables backed up securely
- [ ] Backup monitoring and alerts configured

### Documentation

- [ ] Production deployment documented
- [ ] Runbook updated with any deviations
- [ ] Team trained on deployment process
- [ ] Rollback procedure documented
- [ ] Emergency contacts list created
- [ ] Architecture diagram updated

---

## Rollback Plan

### Trigger Conditions

Rollback if:
- Critical security vulnerability discovered
- Database corruption
- Application crash loop
- 50%+ increase in error rate
- Performance degradation >2x slower
- Data loss risk identified

### Rollback Procedure

#### Docker Compose Rollback

```bash
# 1. Stop current deployment
docker compose -f docker-compose.prod.yml down

# 2. Checkout previous version
git checkout v0.9.0  # Previous stable version

# 3. Restore database backup (if needed)
docker exec betancourt-audio-db pg_restore -U postgres -d betancourt_audio /backups/backup_20251227.sql

# 4. Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# 5. Verify rollback successful
docker compose -f docker-compose.prod.yml ps
curl https://api.betancourtaudio.com/health
```

#### Kubernetes Rollback

```bash
# 1. Rollback deployment
kubectl rollout undo deployment/backend -n betancourt-audio
kubectl rollout undo deployment/frontend -n betancourt-audio

# 2. Verify rollback status
kubectl rollout status deployment/backend -n betancourt-audio

# 3. Check pod health
kubectl get pods -n betancourt-audio
```

#### Database Rollback

```bash
# 1. Stop application (prevent new writes)
docker compose stop backend

# 2. Backup current state (in case rollback fails)
docker exec betancourt-audio-db pg_dump -U postgres betancourt_audio > rollback_backup.sql

# 3. Restore previous backup
docker exec betancourt-audio-db psql -U postgres -d betancourt_audio -f /backups/pre_deploy.sql

# 4. Restart application
docker compose start backend
```

### Post-Rollback

- [ ] Verify application functional
- [ ] Monitor error rates
- [ ] Communicate status to stakeholders
- [ ] Incident post-mortem scheduled
- [ ] Root cause analysis documented
- [ ] Prevention measures identified

---

## Sign-Off

### Deployment Team

- [ ] **Developer**: Code deployed and verified
- [ ] **DevOps**: Infrastructure configured and stable
- [ ] **QA**: All tests passing in production
- [ ] **Product Owner**: Features verified and approved
- [ ] **Security**: Security checklist completed

### Final Verification

- [ ] All checklist items completed
- [ ] No critical errors in logs
- [ ] Monitoring dashboards green
- [ ] User acceptance testing passed
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Backup and restore tested

### Communication

- [ ] Deployment announcement sent to team
- [ ] Customer-facing status page updated
- [ ] Social media announcement (if applicable)
- [ ] Documentation links shared

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Version**: v1.0.0

**Notes**:
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

---

**Next Steps**:
1. Monitor application for 24-48 hours
2. Schedule post-deployment review
3. Plan next release cycle
4. Update documentation based on lessons learned

---

**Related Documentation**:
- README.md - Project overview and local development
- backend/authentication/API_DOCUMENTATION.md - API specifications
- backend/authentication/SECURITY.md - Security guidelines
- backend/authentication/TEST_REPORT.md - Test coverage report

**Support Contacts**:
- **Technical Issues**: dev@betancourtaudio.com
- **Security Issues**: security@betancourtaudio.com
- **Emergency Hotline**: +57 XXX XXX XXXX
