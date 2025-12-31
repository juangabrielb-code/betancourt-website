# Production Deployment Checklist

Complete checklist for deploying Betancourt Audio to production with authentication system.

**Issue:** BET-14 (Documentation and Deploy)
**Last Updated:** 2025-12-30

---

## Pre-Deployment Preparation

### 1. Environment Configuration

- [ ] Create production `.env` file with new secrets
- [ ] Generate new `AUTH_SECRET`: `openssl rand -base64 32`
- [ ] Generate new Django `SECRET_KEY`
- [ ] Set `DEBUG=False` in Django settings
- [ ] Set `NODE_ENV=production`
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Set strong `POSTGRES_PASSWORD` (min 16 characters, alphanumeric + symbols)
- [ ] Update `ALLOWED_HOSTS` to include production domain
- [ ] Update `CORS_ALLOWED_ORIGINS` to production frontend URL
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL

### 2. OAuth Provider Configuration

- [ ] Update Google OAuth redirect URIs to production
- [ ] Update Facebook OAuth redirect URIs to production
- [ ] Update Apple Services ID redirect URIs to production
- [ ] Update Microsoft Entra ID redirect URIs to production
- [ ] Submit Facebook app for review (if using public access)
- [ ] Verify all OAuth apps are in production mode
- [ ] Test each OAuth flow on staging environment

### 3. Database Preparation

- [ ] Backup development database
- [ ] Create production database
- [ ] Run Prisma migrations on production DB
- [ ] Verify all tables created correctly:
  - [ ] users
  - [ ] accounts
  - [ ] sessions
  - [ ] verification_tokens
- [ ] Create database backup strategy
- [ ] Set up automated backups (daily recommended)
- [ ] Configure database connection pooling

### 4. Security Hardening

- [ ] Enable HTTPS/SSL certificates
- [ ] Set `secure: true` for cookies in production
- [ ] Configure Content Security Policy (CSP) headers
- [ ] Enable HTTP Strict Transport Security (HSTS)
- [ ] Configure rate limiting for authentication endpoints
- [ ] Set up Web Application Firewall (WAF) if available
- [ ] Enable database encryption at rest
- [ ] Review and remove any debug/development endpoints
- [ ] Audit all environment variables for sensitive data
- [ ] Set up secrets management (AWS Secrets Manager, Vault, etc.)

### 5. Frontend Build

- [ ] Run production build: `docker compose -f docker-compose.prod.yml build frontend`
- [ ] Verify no build errors or warnings
- [ ] Check bundle size and optimize if needed
- [ ] Enable static file optimization
- [ ] Configure CDN for static assets (optional)
- [ ] Set up image optimization
- [ ] Enable gzip/brotli compression
- [ ] Test frontend on staging environment

### 6. Backend Configuration

- [ ] Collect Django static files: `python manage.py collectstatic`
- [ ] Configure production WSGI server (Gunicorn recommended)
- [ ] Set up reverse proxy (Nginx recommended)
- [ ] Configure static file serving
- [ ] Set up media file storage (S3, GCS, or similar)
- [ ] Enable database connection pooling
- [ ] Configure logging to file/service
- [ ] Test backend on staging environment

---

## Deployment Steps

### 1. Infrastructure Setup

**Option A: Docker Deployment (Recommended for simplicity)**

- [ ] Create `docker-compose.prod.yml`:
  ```yaml
  version: '3.8'

  services:
    db:
      image: postgres:16-alpine
      restart: always
      environment:
        POSTGRES_DB: ${POSTGRES_DB}
        POSTGRES_USER: ${POSTGRES_USER}
        POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      volumes:
        - postgres_data:/var/lib/postgresql/data
      networks:
        - app-network

    backend:
      build:
        context: ./backend
        dockerfile: Dockerfile
      restart: always
      environment:
        - DATABASE_URL=${DATABASE_URL}
        - DEBUG=False
        - SECRET_KEY=${SECRET_KEY}
      depends_on:
        - db
      networks:
        - app-network

    frontend:
      build:
        context: ./frontend
        dockerfile: Dockerfile
      restart: always
      environment:
        - NEXTAUTH_URL=${NEXTAUTH_URL}
        - AUTH_SECRET=${AUTH_SECRET}
        - DATABASE_URL=${DATABASE_URL}
      depends_on:
        - backend
      ports:
        - "3000:3000"
      networks:
        - app-network

  volumes:
    postgres_data:

  networks:
    app-network:
      driver: bridge
  ```

- [ ] Deploy with: `docker compose -f docker-compose.prod.yml up -d`

**Option B: Managed Services**

- [ ] Deploy PostgreSQL to managed service (AWS RDS, Google Cloud SQL, etc.)
- [ ] Deploy Django backend to:
  - [ ] AWS Elastic Beanstalk, or
  - [ ] Google Cloud Run, or
  - [ ] Azure App Service, or
  - [ ] Heroku, or
  - [ ] DigitalOcean App Platform
- [ ] Deploy Next.js frontend to:
  - [ ] Vercel (recommended), or
  - [ ] Netlify, or
  - [ ] AWS Amplify, or
  - [ ] Same platform as backend

### 2. DNS Configuration

- [ ] Point domain to production server/service
- [ ] Set up SSL/TLS certificate (Let's Encrypt, Cloudflare, etc.)
- [ ] Verify HTTPS is working
- [ ] Configure www redirect (if needed)
- [ ] Set up CDN (Cloudflare, AWS CloudFront, etc.)

### 3. Database Migration

- [ ] Run Prisma migrations:
  ```bash
  docker compose -f docker-compose.prod.yml exec frontend npx prisma migrate deploy
  ```
- [ ] Verify migrations applied successfully
- [ ] Create first admin user (if needed):
  ```sql
  UPDATE users SET role = 'ADMIN' WHERE email = 'admin@yourdomain.com';
  ```

### 4. Health Checks

- [ ] Set up health check endpoints
- [ ] Configure monitoring for:
  - [ ] Frontend uptime
  - [ ] Backend uptime
  - [ ] Database connection
  - [ ] OAuth provider connectivity
- [ ] Set up alerting (email, SMS, Slack, PagerDuty)

---

## Post-Deployment Verification

### 1. Functional Testing

- [ ] Access production URL: `https://yourdomain.com`
- [ ] Verify landing page loads correctly
- [ ] Test theme toggle (light/dark)
- [ ] Test language toggle (EN/ES)
- [ ] Click "Sign In" button - AuthModal appears
- [ ] Test Google OAuth login
- [ ] Test Facebook OAuth login
- [ ] Test Apple OAuth login
- [ ] Test Microsoft OAuth login
- [ ] Verify redirect to /dashboard after login
- [ ] Check user info displays correctly
- [ ] Test user dropdown menu
- [ ] Test Sign Out functionality
- [ ] Verify session persistence (refresh page)

### 2. Security Testing

- [ ] Verify HTTPS is enforced (HTTP redirects to HTTPS)
- [ ] Test unauthenticated access to /dashboard (should redirect to home)
- [ ] Test non-admin access to /admin (should redirect to /dashboard)
- [ ] Verify cookies have `httpOnly` and `secure` flags
- [ ] Test CSRF protection
- [ ] Run security scan (OWASP ZAP, Burp Suite, etc.)
- [ ] Check for exposed secrets in client-side code
- [ ] Verify error messages don't leak sensitive info

### 3. Performance Testing

- [ ] Run Lighthouse audit (target: >90 score)
- [ ] Test Time to First Byte (TTFB) < 600ms
- [ ] Test First Contentful Paint (FCP) < 1.8s
- [ ] Test Largest Contentful Paint (LCP) < 2.5s
- [ ] Test Time to Interactive (TTI) < 3.8s
- [ ] Verify API response times < 200ms
- [ ] Test concurrent user load (if expecting high traffic)

### 4. Database Verification

- [ ] Verify users are being created in database
- [ ] Check accounts table has provider linkage
- [ ] Verify sessions are being stored
- [ ] Test session expiration (30 days default)
- [ ] Check Django API endpoints:
  - [ ] GET https://yourdomain.com/api/auth/users/stats/
  - [ ] GET https://yourdomain.com/api/auth/accounts/stats/
  - [ ] GET https://yourdomain.com/api/auth/sessions/stats/

### 5. Monitoring Setup

- [ ] Configure application logging
- [ ] Set up error tracking (Sentry, Rollbar, etc.)
- [ ] Configure performance monitoring (New Relic, Datadog, etc.)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Create dashboards for key metrics:
  - [ ] User signups
  - [ ] Active sessions
  - [ ] OAuth provider usage
  - [ ] Error rates
  - [ ] API response times

---

## Rollback Plan

In case of deployment issues:

### 1. Immediate Rollback Steps

- [ ] Stop production containers/services
- [ ] Restore previous Docker images/deployment
- [ ] Verify previous version is working
- [ ] Check database integrity
- [ ] Notify users if needed

### 2. Database Rollback

If database migrations fail:
```bash
# Rollback last migration
docker compose -f docker-compose.prod.yml exec frontend npx prisma migrate resolve --rolled-back <migration-name>

# Restore from backup if needed
docker compose exec db psql -U postgres -d betancourt_audio < backup.sql
```

### 3. Configuration Rollback

- [ ] Restore previous `.env` file
- [ ] Revert OAuth callback URLs
- [ ] Clear cached configurations

---

## Maintenance

### Daily Tasks

- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review failed login attempts

### Weekly Tasks

- [ ] Review user growth metrics
- [ ] Check OAuth provider quotas/limits
- [ ] Review security alerts
- [ ] Database performance check

### Monthly Tasks

- [ ] Rotate secrets (optional, recommended every 90 days)
- [ ] Update dependencies: `npm audit fix`, `pip list --outdated`
- [ ] Review and optimize database queries
- [ ] Backup verification test (restore to staging)
- [ ] Performance optimization review

### Quarterly Tasks

- [ ] Security audit
- [ ] Review OAuth provider terms/pricing changes
- [ ] Update documentation
- [ ] Review and archive old sessions
- [ ] Capacity planning review

---

## Scaling Considerations

When your application grows:

### Horizontal Scaling

- [ ] Set up load balancer
- [ ] Deploy multiple frontend instances
- [ ] Deploy multiple backend instances
- [ ] Configure session affinity if using database sessions
- [ ] Set up Redis for session storage (optional)

### Database Scaling

- [ ] Enable read replicas
- [ ] Configure connection pooling (PgBouncer)
- [ ] Implement caching layer (Redis, Memcached)
- [ ] Consider database sharding for very large scale

### CDN and Caching

- [ ] Move static assets to CDN
- [ ] Enable edge caching
- [ ] Configure cache headers properly
- [ ] Use next/image for optimized image delivery

---

## Support and Documentation

- [ ] Update README.md with production URLs
- [ ] Document deployment process for team
- [ ] Create runbook for common issues
- [ ] Set up support channels (email, chat, etc.)
- [ ] Create user documentation for authentication
- [ ] Train support team on troubleshooting auth issues

---

## Compliance and Legal

- [ ] Update Terms of Service
- [ ] Update Privacy Policy (mention OAuth providers)
- [ ] Ensure GDPR compliance (if applicable)
- [ ] Implement cookie consent (if required)
- [ ] Add data deletion functionality
- [ ] Configure data retention policies

---

## Final Checklist

Before announcing production launch:

- [ ] All tests passing
- [ ] All OAuth providers working
- [ ] Monitoring and alerting configured
- [ ] Backups verified
- [ ] Rollback plan tested
- [ ] Team trained on new system
- [ ] Documentation complete
- [ ] Legal/compliance requirements met
- [ ] Performance benchmarks met
- [ ] Security audit completed

---

**Status:** Ready for Production Deployment ✅

**Date Deployed:** _______________

**Deployed By:** _______________

**Production URL:** _______________

---

For issues during deployment, refer to:
- `OAUTH_SETUP_GUIDE.md` - OAuth configuration help
- `TESTING_CHECKLIST.md` - Verification procedures
- Auth.js Documentation: https://authjs.dev
- Project README.md - Architecture overview
