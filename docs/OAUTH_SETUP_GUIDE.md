# OAuth Providers Setup Guide

Complete guide to configure OAuth authentication providers for Betancourt Audio.

**Issue:** BET-5 (Social Authentication)
**Last Updated:** 2025-12-30

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google OAuth Setup](#1-google-oauth-setup)
3. [Facebook OAuth Setup](#2-facebook-oauth-setup)
4. [Apple Sign In Setup](#3-apple-sign-in-setup)
5. [Microsoft Entra ID Setup](#4-microsoft-entra-id-azure-ad-setup)
6. [Testing OAuth Configuration](#testing-oauth-configuration)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before configuring OAuth providers, ensure you have:

- [ ] Access to Google Cloud Console
- [ ] Access to Facebook Developers Portal
- [ ] Apple Developer Account (paid, $99/year)
- [ ] Access to Microsoft Azure Portal
- [ ] `.env` file created from `.env.example`
- [ ] `AUTH_SECRET` generated: `openssl rand -base64 32`
- [ ] Application running locally on `http://localhost:3000`

---

## 1. Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Betancourt Audio"
4. Click "Create"

### Step 2: Enable OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services** → **OAuth consent screen**
2. Choose "External" (for public users) or "Internal" (for organization only)
3. Fill in required information:
   - **App name:** Betancourt Audio
   - **User support email:** your-email@example.com
   - **Developer contact email:** your-email@example.com
4. Click "Save and Continue"
5. Add scopes (optional for basic auth):
   - `userinfo.email`
   - `userinfo.profile`
6. Click "Save and Continue"
7. Add test users (for development)
8. Click "Save and Continue"

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click "**+ CREATE CREDENTIALS**" → "OAuth client ID"
3. Choose application type: **Web application**
4. Enter name: "Betancourt Audio Web Client"
5. Add **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://yourdomain.com (for production)
   ```
6. Add **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google (for production)
   ```
7. Click "Create"
8. **Copy the Client ID and Client Secret**

### Step 4: Update .env File

```bash
AUTH_GOOGLE_ID=your-client-id-here.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
```

---

## 2. Facebook OAuth Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose use case: **Authenticate and request data from users with Facebook Login**
4. Enter app details:
   - **App name:** Betancourt Audio
   - **App contact email:** your-email@example.com
5. Click "Create App"

### Step 2: Add Facebook Login Product

1. In the dashboard, find "**Facebook Login**" product
2. Click "Set Up"
3. Choose platform: **Web**
4. Enter Site URL: `http://localhost:3000`
5. Click "Save" and "Continue"

### Step 3: Configure Facebook Login Settings

1. Go to **Products** → **Facebook Login** → **Settings**
2. Add **Valid OAuth Redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://yourdomain.com/api/auth/callback/facebook (for production)
   ```
3. Enable these settings:
   - ✅ Client OAuth Login
   - ✅ Web OAuth Login
4. Click "Save Changes"

### Step 4: Get App ID and Secret

1. Go to **Settings** → **Basic**
2. Copy **App ID**
3. Click "Show" next to **App Secret** and copy it

### Step 5: Update .env File

```bash
AUTH_FACEBOOK_ID=your-app-id-here
AUTH_FACEBOOK_SECRET=your-app-secret-here
```

### Step 6: App Review (For Production)

For production, you must:
1. Go to **App Review** → **Permissions and Features**
2. Request advanced access for:
   - `public_profile`
   - `email`
3. Submit app for review with screenshots and description

---

## 3. Apple Sign In Setup

### Step 1: Register App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources)
2. Navigate to **Certificates, IDs & Profiles** → **Identifiers**
3. Click "**+**" to register a new identifier
4. Choose **App IDs** → Click "Continue"
5. Choose **App** type → Click "Continue"
6. Fill in details:
   - **Description:** Betancourt Audio
   - **Bundle ID:** com.betancourtaudio.app (reverse domain)
7. Under Capabilities, check ✅ **Sign in with Apple**
8. Click "Continue" → "Register"

### Step 2: Create Services ID

1. Go back to **Identifiers**
2. Click "**+**" → Choose **Services IDs** → Continue
3. Fill in details:
   - **Description:** Betancourt Audio Web Service
   - **Identifier:** com.betancourtaudio.service
4. Check ✅ **Sign in with Apple**
5. Click "Configure" next to Sign in with Apple
6. Select your primary App ID created in Step 1
7. Add **Website URLs:**
   - **Domains:** `localhost:3000`, `yourdomain.com`
   - **Return URLs:**
     ```
     http://localhost:3000/api/auth/callback/apple
     https://yourdomain.com/api/auth/callback/apple
     ```
8. Click "Save" → "Continue" → "Register"

### Step 3: Create Private Key

1. Go to **Keys** section
2. Click "**+**" to register a new key
3. Enter **Key Name:** Betancourt Audio Sign In Key
4. Check ✅ **Sign in with Apple**
5. Click "Configure" → Select your primary App ID
6. Click "Save" → "Continue" → "Register"
7. **Download the .p8 key file** (can only download once!)
8. Note the **Key ID** shown

### Step 4: Get Team ID

1. Go to [Membership page](https://developer.apple.com/account/#/membership/)
2. Copy your **Team ID**

### Step 5: Convert Private Key to String

```bash
# Read the .p8 file content
cat AuthKey_XXXXXXXXXX.p8
```

Copy the entire content including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines.

### Step 6: Update .env File

```bash
AUTH_APPLE_ID=com.betancourtaudio.service
AUTH_APPLE_SECRET="-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
(entire key content here, newlines preserved)
-----END PRIVATE KEY-----"
```

**Note:** You may need to format the key as a single-line string with `\n` for newlines depending on your environment.

---

## 4. Microsoft Entra ID (Azure AD) Setup

### Step 1: Register Application

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Microsoft Entra ID** (Azure Active Directory)
3. Click **App registrations** → **+ New registration**
4. Fill in details:
   - **Name:** Betancourt Audio
   - **Supported account types:** Accounts in any organizational directory and personal Microsoft accounts
   - **Redirect URI:** Web platform
     ```
     http://localhost:3000/api/auth/callback/microsoft-entra-id
     ```
5. Click "Register"

### Step 2: Add Additional Redirect URIs

1. In your registered app, go to **Authentication**
2. Under "Web" platform, click "Add URI"
3. Add production URL:
   ```
   https://yourdomain.com/api/auth/callback/microsoft-entra-id
   ```
4. Under "Implicit grant and hybrid flows":
   - ✅ ID tokens (for implicit and hybrid flows)
5. Click "Save"

### Step 3: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **+ New client secret**
3. Enter description: "Betancourt Audio Production Secret"
4. Choose expiration: 24 months (recommended)
5. Click "Add"
6. **Copy the Secret Value immediately** (it won't be shown again!)

### Step 4: Configure API Permissions

1. Go to **API permissions**
2. Verify these permissions are present:
   - `openid`
   - `profile`
   - `email`
3. If not, click **+ Add a permission** → **Microsoft Graph** → **Delegated permissions**
4. Search and add the missing permissions
5. Click "Grant admin consent" (if you have admin rights)

### Step 5: Get Application Details

1. Go to **Overview** page
2. Copy these values:
   - **Application (client) ID**
   - **Directory (tenant) ID** (or use "common" for multi-tenant)

### Step 6: Update .env File

```bash
AUTH_MICROSOFT_ENTRA_ID_ID=your-application-client-id
AUTH_MICROSOFT_ENTRA_ID_SECRET=your-client-secret-value
AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=common
```

**Note:** Use `common` for multi-tenant apps (personal + work/school accounts). Use your specific tenant ID to restrict to your organization only.

---

## Testing OAuth Configuration

### Test Each Provider Locally

1. Start your Docker containers:
   ```bash
   docker compose up
   ```

2. Navigate to `http://localhost:3000`

3. Click the "Sign In" button in the navbar

4. Test each provider button:
   - **Google:** Should redirect to Google login
   - **Facebook:** Should redirect to Facebook login
   - **Apple:** Should redirect to Apple ID login
   - **Microsoft:** Should redirect to Microsoft login

### Verify Successful Authentication

After successful login, verify:

- [ ] User is redirected to `/dashboard`
- [ ] User info displays correctly (name, email, avatar)
- [ ] Session persists on page refresh
- [ ] Django API shows user in `/api/auth/users/`
- [ ] Database contains user record in `users` table
- [ ] Account record exists in `accounts` table with correct provider

### Check Database

```bash
# Connect to database
docker compose exec db psql -U postgres -d betancourt_audio

# Check users
SELECT id, name, email, role FROM users;

# Check accounts
SELECT provider, "providerAccountId" FROM accounts;

# Exit
\q
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Generate new `AUTH_SECRET` for production
- [ ] Update all OAuth callback URLs to production domain
- [ ] Set `DEBUG=False` in Django
- [ ] Generate new Django `SECRET_KEY`
- [ ] Use strong `POSTGRES_PASSWORD`
- [ ] Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
- [ ] Enable HTTPS/SSL certificates
- [ ] Set `secure: true` for cookies in auth.ts

### Update OAuth Providers

For each provider, add production redirect URIs:

**Google:**
```
https://yourdomain.com/api/auth/callback/google
```

**Facebook:**
```
https://yourdomain.com/api/auth/callback/facebook
```

**Apple:**
```
https://yourdomain.com/api/auth/callback/apple
```

**Microsoft:**
```
https://yourdomain.com/api/auth/callback/microsoft-entra-id
```

### Environment Variables for Production

```bash
AUTH_SECRET=<new-secret-generated-with-openssl>
NEXTAUTH_URL=https://yourdomain.com
DEBUG=False
SECRET_KEY=<new-django-secret>
```

---

## Troubleshooting

### Common Issues

#### 1. "redirect_uri_mismatch" Error

**Problem:** OAuth provider rejects redirect URI

**Solution:**
- Verify the redirect URI in provider console exactly matches:
  ```
  http://localhost:3000/api/auth/callback/{provider}
  ```
- Check for trailing slashes or typos
- Ensure the URI is registered as a Web platform redirect

#### 2. "Access Denied" or "Unauthorized" Error

**Problem:** User sees error after clicking provider button

**Solution:**
- Check provider credentials in `.env` are correct
- Verify `AUTH_SECRET` is generated and set
- Check browser console for detailed error messages
- Ensure provider app is in correct mode (development vs production)

#### 3. Session Not Persisting

**Problem:** User logged out on page refresh

**Solution:**
- Verify `NEXTAUTH_URL` matches current domain
- Check browser cookies are enabled
- Verify database connection and session table exists
- Check `AUTH_SECRET` hasn't changed between restarts

#### 4. Provider-Specific Issues

**Google:**
- If "This app isn't verified" appears, add test users in OAuth consent screen
- Verify scopes `userinfo.email` and `userinfo.profile` are enabled

**Facebook:**
- App must be in Development mode for testing
- For production, submit for App Review
- Verify `email` permission is granted

**Apple:**
- Private key must include newline characters correctly
- Verify Services ID exactly matches `AUTH_APPLE_ID`
- Check Team ID and Key ID are correct

**Microsoft:**
- If "AADSTS" error appears, check tenant ID configuration
- Verify redirect URI includes full path with `/microsoft-entra-id`
- Check client secret hasn't expired

#### 5. Database Connection Issues

**Problem:** "Prisma Client not generated" or connection errors

**Solution:**
```bash
# Regenerate Prisma client
docker compose exec frontend npx prisma generate

# Restart frontend
docker compose restart frontend
```

### Debug Mode

Enable debug mode in Auth.js:

In `frontend/src/auth.ts`, `debug` is already set to:
```typescript
debug: process.env.NODE_ENV === "development"
```

Check browser console and server logs for detailed error messages.

### Get Help

- Auth.js Documentation: https://authjs.dev
- Auth.js Discord: https://discord.gg/authjs
- Provider Documentation:
  - [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
  - [Facebook Login](https://developers.facebook.com/docs/facebook-login)
  - [Apple Sign In](https://developer.apple.com/sign-in-with-apple/)
  - [Microsoft Identity](https://learn.microsoft.com/en-us/azure/active-directory/develop/)

---

## Security Best Practices

1. **Never commit `.env` file** - Always use `.env.example` for templates
2. **Rotate secrets regularly** - Especially before production deployment
3. **Use environment-specific credentials** - Different keys for dev/staging/prod
4. **Enable 2FA** on all provider accounts
5. **Monitor OAuth usage** - Check provider dashboards for unusual activity
6. **Implement rate limiting** - Prevent brute force attacks
7. **Log authentication events** - Track successful/failed login attempts
8. **Keep dependencies updated** - Regular `npm audit` and updates

---

**Need additional help?** Check `TESTING_CHECKLIST.md` for verification steps or review error logs in Docker containers.
