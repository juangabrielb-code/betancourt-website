# Betancourt Audio - Professional Audio Engineering Platform

Premium mixing, mastering, and production services website built with Next.js 16 and Django, featuring a Japandi design system, full bilingual support (EN/ES), and dual authentication systems (OAuth + Email/Password).

**Status**: ✅ Dual Authentication System Integrated | OAuth (Google, Facebook, Apple, Microsoft) + Email/Password

## 🎯 Features

- ✨ **Japandi Design System**: Minimalist aesthetic combining Japanese and Scandinavian design principles
- 🔐 **Dual Authentication**: OAuth social login (Google, Facebook, Apple, Microsoft) + Traditional email/password with JWT
- 🌍 **Bilingual Support**: Full English/Spanish translations with automatic language detection
- 💰 **Multi-Currency**: USD and COP pricing with automatic currency selection
- 🔒 **Secure Payments**: Integration with Stripe (USD) and Bold (COP)
- 📊 **Client Dashboard**: Project management, file uploads, progress tracking
- ⚙️ **Admin Panel**: Service management with bilingual content editor
- 🎨 **Interactive Elements**: Parallax backgrounds, VU meter animations, draggable console fader
- 📱 **Responsive Design**: Mobile-first approach with smooth Framer Motion animations

## 🛠 Tech Stack

### Frontend
- **Next.js 16.1.0** - React framework with App Router & Turbopack
- **React 19** - UI library with latest features
- **TypeScript** - Full type safety
- **Tailwind CSS v4** - Utility-first CSS with custom Japandi theme
- **Framer Motion** - Smooth animations and scroll effects
- **Auth.js v5 (NextAuth.js)** - OAuth authentication (Google, Facebook, Apple, Microsoft)
- **Prisma v7.2.0** - ORM for OAuth data access

### Backend
- **Django 5.1.4** - Python web framework
- **Django REST Framework** - RESTful API development
- **PostgreSQL 16** - Single shared database for both auth systems
- **Argon2-cffi** - Password hashing (OWASP recommended)
- **djangorestframework-simplejwt** - JWT token authentication

### Authentication Architecture

This application features a **dual authentication system** allowing users to choose between:

#### 1. **OAuth Social Login** (Auth.js v5)
- **Providers**: Google, Facebook, Apple, Microsoft Entra ID
- **Database**: Prisma-managed tables (`users`, `accounts`, `sessions`, `verification_tokens`)
- **Session**: JWT-based, 30-day duration
- **Use Case**: Quick signup/login using existing social accounts

#### 2. **Email/Password Authentication** (Django REST API)
- **Security**: Argon2id password hashing (OWASP recommended)
- **Database**: Django-managed `auth_user` table with UUID primary keys
- **Tokens**: JWT access + refresh tokens
- **Features**: Email verification, password reset, password change
- **Endpoints**: `/api/auth/register/`, `/api/auth/login/`, `/api/auth/logout/`, `/api/auth/forgot-password/`, `/api/auth/reset-password/`, `/api/auth/change-password/`, `/api/auth/profile/`
- **Use Case**: Traditional registration for users who prefer email/password

Both systems share the same PostgreSQL database and coexist through Django's read-only models that allow the Django backend to access OAuth user data when needed.

### State Management
- **React Context API** - Theme, Language, Currency, and Auth state
- **localStorage** - Client-side persistence for user preferences

### Infrastructure
- **Docker & Docker Compose** - Containerized development and deployment
- **PostgreSQL 16** - Shared database for both authentication systems

## 📁 Project Structure

```
betancourt-website/
├── backend/                    # Django REST API
│   ├── authentication/         # Email/password auth system
│   │   ├── models.py          # User model + OAuth read-only models
│   │   ├── views.py           # API endpoints (register, login, etc.)
│   │   ├── serializers.py     # DRF serializers
│   │   ├── urls.py            # API routes
│   │   └── tests.py           # 28 passing tests
│   ├── config/                # Django settings
│   ├── manage.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # Next.js 16 App
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── api/auth/[...nextauth]/  # Auth.js route handler
│   │   │   ├── dashboard/     # Protected user dashboard
│   │   │   ├── admin/         # Admin-only page
│   │   │   └── page.tsx       # Home page
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── AuthModal.tsx  # Unified auth modal (OAuth + Email/Password)
│   │   │   ├── shared/
│   │   │   │   └── Navbar.tsx     # Navigation with auth state
│   │   │   └── ui/            # Reusable UI components
│   │   ├── contexts/          # React Context providers
│   │   │   ├── AuthContext.tsx    # Auth state wrapper
│   │   │   ├── ThemeContext.tsx   # Dark/light theme
│   │   │   └── LanguageContext.tsx # i18n
│   │   ├── auth.ts            # Auth.js configuration
│   │   ├── middleware.ts      # Route protection
│   │   └── lib/
│   ├── prisma/
│   │   └── schema.prisma      # Prisma schema for OAuth
│   ├── package.json
│   ├── Dockerfile
│   └── tailwind.config.ts
├── docker-compose.yml          # Multi-container orchestration
├── .env.example                # Environment variables template
└── README.md

```

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose (included in Docker Desktop)

**Note**: You don't need to install Python, Node.js, PostgreSQL, or any other dependencies on your local machine.

### 1. Clone and Setup

```bash
cd betancourt-website

# Copy environment variables
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` and configure:

**Required for OAuth:**
```bash
# Generate AUTH_SECRET
openssl rand -base64 32

# Add to .env
AUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000

# Configure OAuth providers (see OAuth Setup section below)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
# ... (Facebook, Apple, Microsoft)
```

**Required for Email/Password:**
```bash
# Django settings are pre-configured for development
SECRET_KEY=django-insecure-dev-key-change-in-production-please
DEBUG=True
```

### 3. Start Services

```bash
# Start all services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### 4. Run Database Migrations

```bash
# Django migrations (for email/password auth)
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

# Prisma migrations (for OAuth auth)
docker compose exec frontend npx prisma generate
docker compose exec frontend npx prisma db push
```

### 5. Create Admin User

```bash
docker compose exec backend python manage.py createsuperuser
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/auth/

## 🔐 OAuth Provider Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret to `.env`:
   ```
   AUTH_GOOGLE_ID=your-client-id
   AUTH_GOOGLE_SECRET=your-client-secret
   ```

### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/apps)
2. Create a new app or use existing
3. Add "Facebook Login" product
4. Configure OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/facebook`
5. Copy App ID and App Secret to `.env`

### Apple OAuth

1. Go to [Apple Developer](https://developer.apple.com/account/resources)
2. Create Service ID
3. Enable "Sign in with Apple"
4. Configure Return URLs: `http://localhost:3000/api/auth/callback/apple`
5. Generate and download private key (.p8 file)
6. Copy Service ID and convert .p8 key to string format for `.env`

### Microsoft Entra ID (Azure AD)

1. Go to [Azure Portal](https://portal.azure.com/#view/Microsoft_AAD_IAM)
2. Register application in Azure AD
3. Add Redirect URI: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
4. Create client secret
5. Copy Application (client) ID and client secret to `.env`
6. Set Tenant ID (use `common` for multi-tenant)

For detailed setup guides, see `docs/OAUTH_SETUP_GUIDE.md`

## 📝 Authentication API Endpoints

### Email/Password Authentication (Django REST)

```
POST /api/auth/register/
  Body: { email, password, first_name, last_name }
  Response: { user, tokens: { access, refresh } }

POST /api/auth/login/
  Body: { email, password }
  Response: { user, tokens: { access, refresh } }

POST /api/auth/logout/
  Body: { refresh_token }
  Response: { message: "Logged out successfully" }

POST /api/auth/forgot-password/
  Body: { email }
  Response: { message: "Password reset email sent" }

POST /api/auth/reset-password/
  Body: { token, new_password }
  Response: { message: "Password reset successful" }

POST /api/auth/change-password/
  Headers: { Authorization: "Bearer <access_token>" }
  Body: { old_password, new_password }
  Response: { message: "Password changed successfully" }

GET /api/auth/profile/
  Headers: { Authorization: "Bearer <access_token>" }
  Response: { id, email, first_name, last_name, role, ... }
```

### OAuth Authentication (Auth.js)

OAuth authentication is handled automatically by Auth.js through the frontend:

```typescript
// Sign in with provider
import { signIn } from 'next-auth/react';

await signIn('google', { callbackUrl: '/dashboard' });
await signIn('facebook', { callbackUrl: '/dashboard' });
await signIn('apple', { callbackUrl: '/dashboard' });
await signIn('microsoft-entra-id', { callbackUrl: '/dashboard' });

// Sign out
import { signOut } from 'next-auth/react';
await signOut({ callbackUrl: '/' });

// Get session
import { useSession } from 'next-auth/react';
const { data: session, status } = useSession();
```

## 🧪 Running Tests

```bash
# Backend tests (28 passing)
docker compose exec backend python manage.py test

# Frontend tests
docker compose exec frontend npm test
```

## 🏗 Database Schema

### Email/Password Tables (Django-managed)
- `auth_user` - User accounts with email/password
- `password_reset_tokens` - Secure password reset tokens

### OAuth Tables (Prisma-managed)
- `users` - OAuth user accounts
- `accounts` - OAuth provider connections
- `sessions` - Active OAuth sessions
- `verification_tokens` - Email verification for OAuth

Django can read OAuth data through read-only models defined in `backend/authentication/models.py`.

## 🔧 Development Commands

```bash
# View logs
docker compose logs -f [service-name]

# Restart a service
docker compose restart [service-name]

# Rebuild after dependency changes
docker compose build
docker compose up -d

# Access container shell
docker compose exec backend bash
docker compose exec frontend sh

# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

## 📦 Deployment

For production deployment:

1. Set `DEBUG=False` in `.env`
2. Generate new `SECRET_KEY` and `AUTH_SECRET`
3. Update `NEXTAUTH_URL` to production domain
4. Update all OAuth callback URLs in provider consoles
5. Set strong `POSTGRES_PASSWORD`
6. Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
7. Use production-grade database
8. Enable HTTPS
9. Set up proper logging and monitoring

See `docs/DEPLOYMENT_CHECKLIST.md` for complete deployment guide.

## 🎨 UI Components

The AuthModal component (`frontend/src/components/auth/AuthModal.tsx`) provides a unified authentication interface with:
- 4 OAuth provider buttons (Google, Facebook, Apple, Microsoft)
- Divider: "or continue with email"
- Email/password form with login/signup toggle
- Proper error handling and loading states
- Disabled state management to prevent conflicts

## 🌍 Internationalization (i18n)

Full bilingual support (English/Spanish) is implemented through:
- `frontend/src/contexts/LanguageContext.tsx` - Translation context
- `frontend/src/translations/` - Translation files
- Automatic language detection based on browser settings
- Manual language toggle in navigation bar

## 🐛 Known Issues

- Production build requires proper OAuth credentials to be configured
- Some OAuth providers may require HTTPS for production use

## 📄 License

Proprietary - All rights reserved

## 👤 Author

**Jhon Betancourt**
Professional Audio Engineer & Full Stack Developer

---

**Need Help?** Check the documentation in the `docs/` folder or open an issue.
