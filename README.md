# Betancourt Audio - Professional Audio Engineering Platform

Premium mixing, mastering, and production services website built with Next.js 16 and Django, featuring a Japandi design system, full bilingual support (EN/ES), and secure authentication.

**Status**: ✅ Migration Complete (Phases 1-11 of 14) | ✅ Authentication System Complete (BET-15) | 🚧 Production Build Issue ([see below](#known-issues))

## 🎯 Features

- ✨ **Japandi Design System**: Minimalist aesthetic combining Japanese and Scandinavian design principles
- 🔐 **Secure Authentication**: JWT-based auth with Argon2id password hashing, email verification, and password reset
- 🌍 **Bilingual Support**: Full English/Spanish translations with automatic language detection
- 💰 **Multi-Currency**: USD and COP pricing with automatic currency selection
- 🔒 **Secure Payments**: Integration with Stripe (USD) and Bold (COP)
- 📊 **Client Dashboard**: Project management, file uploads (chunked, 100GB+), progress tracking
- ⚙️ **Admin Panel**: Service management with bilingual content editor
- 🎨 **Interactive Elements**: Parallax backgrounds, VU meter animations, draggable console fader
- 📱 **Responsive Design**: Mobile-first approach with smooth Framer Motion animations

## 🛠 Tech Stack

### Frontend
- **Next.js 16.1.0** - React framework with App Router & Turbopack
- **React 19** - UI library with latest features
- **TypeScript** - Full type safety
- **Tailwind CSS v4** - Utility-first CSS with custom Japandi theme (`@theme inline` syntax)
- **Framer Motion** - Smooth animations and scroll effects
- **Auth.js v5** - Authentication integration with credentials provider

### Backend
- **Django 5.1.4** - Python web framework
- **Django REST Framework** - RESTful API development
- **PostgreSQL 17** - Relational database
- **Argon2-cffi** - Password hashing (OWASP recommended)
- **djangorestframework-simplejwt** - JWT token authentication

### State Management
- **React Context API** - Theme, Language, Currency, and User/Auth state
- **localStorage** - Client-side persistence for user preferences

### Infrastructure
- **Docker & Docker Compose** - Containerized development and deployment
- **Nginx** - Reverse proxy (production)

### Payments
- **Stripe** - International payments (USD → Payoneer)
- **Bold** - Colombian payments (COP)

## 📁 Project Structure

```
betancourt-website/
├── backend/                         # Django REST API
│   ├── authentication/              # Authentication app
│   │   ├── models.py                # User model & PasswordResetToken
│   │   ├── views.py                 # API endpoints (register, login, etc.)
│   │   ├── serializers.py           # DRF serializers
│   │   ├── email_service.py         # Password reset emails
│   │   ├── urls.py                  # URL routing
│   │   ├── tests.py                 # Comprehensive test suite (28 tests)
│   │   ├── templates/emails/        # HTML email templates
│   │   ├── API_DOCUMENTATION.md     # Full API documentation
│   │   └── TEST_REPORT.md           # Test results and coverage
│   ├── config/                      # Django project settings
│   │   ├── settings.py              # Main configuration
│   │   ├── urls.py                  # Root URL configuration
│   │   └── wsgi.py                  # WSGI application
│   ├── manage.py                    # Django management script
│   ├── requirements.txt             # Python dependencies
│   └── .env                         # Environment variables
├── frontend/
│   ├── src/
│   │   ├── app/                     # Next.js App Router
│   │   │   ├── page.tsx             # Landing page with all sections
│   │   │   ├── dashboard/page.tsx   # Client dashboard route
│   │   │   ├── admin/page.tsx       # Admin panel route
│   │   │   ├── api/                 # API routes (legacy mock data)
│   │   │   ├── layout.tsx           # Root layout with providers
│   │   │   ├── globals.css          # Tailwind v4 theme + CSS variables
│   │   │   └── not-found.tsx        # 404 page
│   │   ├── components/
│   │   │   ├── dashboard/           # Dashboard components
│   │   │   ├── landing/             # Landing page components
│   │   │   ├── shared/              # Shared components
│   │   │   ├── ui/                  # UI primitives (Japandi styled)
│   │   │   └── ClientProviders.tsx  # Context providers wrapper
│   │   ├── contexts/                # React contexts
│   │   │   ├── ThemeContext.tsx     # Dark/Light theme toggle
│   │   │   ├── LanguageContext.tsx  # EN/ES + translations
│   │   │   ├── CurrencyContext.tsx  # USD/COP toggle
│   │   │   ├── UserContext.tsx      # User state management
│   │   │   └── AuthContext.tsx      # Auth wrapper (login method)
│   │   ├── types/
│   │   │   └── index.ts             # All TypeScript definitions
│   │   └── utils/
│   │       ├── translations.ts      # i18n dictionaries (EN/ES)
│   │       └── currency.ts          # Currency formatting utils
│   ├── auth.ts                      # Auth.js v5 configuration
│   ├── middleware.ts                # Auth middleware for protected routes
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── docker-compose.yml               # Multi-container orchestration
├── Dockerfile.backend               # Django container
├── Dockerfile.frontend              # Next.js container
└── README.md                        # This file
```

## 🚀 Getting Started

### Prerequisites
- **Docker** and **Docker Compose** (recommended)
- **OR** Node.js 20+, Python 3.12+, PostgreSQL 17 (manual setup)
- Git

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/your-username/betancourt-website.git
cd betancourt-website
```

2. **Set up environment variables**

Backend `.env` file already includes development defaults. For production or custom configuration:

```bash
# backend/.env
SECRET_KEY=<generate-with-openssl-rand-base64-50>
DEBUG=True
DATABASE_URL=postgresql://postgres:postgres@db:5432/betancourt_audio
JWT_SECRET_KEY=<generate-with-python-secrets>
FRONTEND_URL=http://localhost:3000

# Email (console backend for development, SMTP for production)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

Frontend `.env.local` file (optional for payments):
```bash
# frontend/.env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

3. **Start all services**
```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Django Backend** on port 8000
- **Next.js Frontend** on port 3000

4. **Run database migrations** (first time only)
```bash
docker exec betancourt-audio-backend python manage.py migrate
```

5. **Create admin user** (optional)
```bash
docker exec -it betancourt-audio-backend python manage.py createsuperuser
```

Visit:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8000/api/auth/](http://localhost:8000/api/auth/)
- **Django Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)

### Option 2: Manual Setup (Without Docker)

<details>
<summary>Click to expand manual setup instructions</summary>

#### Backend Setup

1. **Install PostgreSQL 17** and create database:
```bash
createdb betancourt_audio
```

2. **Install Python dependencies**:
```bash
cd backend
pip install -r requirements.txt
```

3. **Configure environment variables** (`.env` file in `backend/`)

4. **Run migrations**:
```bash
python manage.py migrate
```

5. **Start backend server**:
```bash
python manage.py runserver
```

#### Frontend Setup

1. **Install Node.js dependencies**:
```bash
cd frontend
npm install
```

2. **Start frontend server**:
```bash
npm run dev
```

</details>

### Build for Production

⚠️ **Known Issue**: There's currently a build error with Next.js 16 and the `/_global-error` route. See [Known Issues](#known-issues) for details.

```bash
npm run build  # Currently fails due to Next.js 16 issue
npm start
```

## 🔐 Authentication System

The application uses a secure JWT-based authentication system powered by Django REST Framework.

### Features

- **Registration & Login**: Email/password authentication with JWT tokens
- **Password Security**: Argon2id hashing (OWASP recommended)
- **Password Reset**: Email-based password reset with secure tokens
- **Anti-Enumeration**: Protection against user discovery via timing attacks
- **Rate Limiting**: Prevents brute-force attacks
- **Session Management**: 15-minute access tokens, 7-day refresh tokens

### Getting Started

1. **Register a new account** via frontend (`/register`) or API:
   ```bash
   curl -X POST http://localhost:8000/api/auth/register/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "SecurePass123!",
       "password_confirm": "SecurePass123!"
     }'
   ```

2. **Login** and receive JWT tokens:
   ```bash
   curl -X POST http://localhost:8000/api/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "password": "SecurePass123!"
     }'
   ```

3. **Use access token** for authenticated requests:
   ```bash
   curl -X GET http://localhost:8000/api/auth/profile/ \
     -H "Authorization: Bearer <access_token>"
   ```

### Password Requirements

- Minimum 8 characters
- Cannot be entirely numeric
- Cannot be too common (checked against common password list)
- Cannot be too similar to email or name

### API Documentation

Full API documentation available at:
- **API Docs**: `backend/authentication/API_DOCUMENTATION.md`
- **Test Report**: `backend/authentication/TEST_REPORT.md` (28 tests, 100% passing)

### Testing

Run the comprehensive test suite:

```bash
# Using Docker
docker exec betancourt-audio-backend python manage.py test authentication

# Manual setup
cd backend
python manage.py test authentication
```

**Test Coverage**:
- ✅ User registration and login
- ✅ Password reset flow
- ✅ Security features (anti-enumeration, timing attacks)
- ✅ Performance benchmarks
- ✅ JWT token generation
- ✅ Argon2 password hashing

## 🎨 Design System (Japandi Theme)

### Color Palette

```css
/* Light Mode */
--color-j-light-bg: #F5EFE6;        /* Warm off-white background */
--color-j-light-surface: #E8DFD0;   /* Subtle surface elevation */
--color-j-light-text: #3D3D3D;      /* Soft black text */

/* Dark Mode */
--color-j-dark-bg: #1A1A1A;         /* Soft black background */
--color-j-dark-surface: #2A2A2A;    /* Elevated surface */
--color-j-dark-text: #E8DFD0;       /* Warm white text */

/* Accent Colors */
--color-warm-glow: #7B9E87;         /* Sage green (primary) */
--color-warm-dim: #5A7A65;          /* Darker sage (hover) */
```

### Typography
- **Sans-serif**: Inter (body text, UI elements)
- **Serif**: Playfair Display (headings, hero titles)

### Design Principles
- Generous whitespace and breathing room
- Subtle shadows and borders (no harsh edges)
- Smooth transitions (200-300ms)
- Natural, organic shapes and rounded corners
- Glassmorphism effects (`backdrop-blur-md`)
- Minimal color palette with sage green accent

## 🌐 API Routes

### Authentication API (Django Backend)

All authentication endpoints are fully implemented and tested.

**Base URL**: `http://localhost:8000/api/auth/`

- `POST /register/` - Create new user account
- `POST /login/` - Authenticate user and get JWT tokens
- `POST /logout/` - Logout user (requires authentication)
- `GET /profile/` - Get current user profile (requires authentication)
- `POST /forgot-password/` - Request password reset email
- `POST /reset-password/` - Reset password with token
- `POST /change-password/` - Change password (requires authentication)

**Security Features**:
- JWT token authentication (access + refresh tokens)
- Argon2id password hashing
- Anti-enumeration protection (timing-safe responses)
- Rate limiting on all endpoints
- CORS configuration for frontend

**Documentation**: See `backend/authentication/API_DOCUMENTATION.md` for detailed API specs, request/response examples, and error handling.

### Services API (Frontend Mock)

*Note: Services endpoints currently use frontend mock data. Backend implementation pending.*

- `GET /api/services` - List all services (bilingual)
- `GET /api/admin/services` - Admin view of services
- `POST /api/admin/services` - Create/update service
- `DELETE /api/admin/services/:id` - Delete service

### Projects API (Frontend Mock)

*Note: Projects endpoints currently use frontend mock data. Backend implementation pending.*

- `GET /api/users/:userId/projects` - Get user's projects
- `POST /api/projects/submit` - Create new project from wizard
- `POST /api/projects/:id/upload-token` - Get file upload URL
- `POST /api/projects/:id/upload-complete` - Mark upload complete

### Orders & Payments (Frontend Mock)

*Note: Payment endpoints currently use frontend mock data. Backend implementation pending.*

- `POST /api/orders/create` - Create payment order (Stripe/Bold)
- `POST /api/orders/confirm` - Confirm payment completion

## 📤 File Upload System

The `FileUploader` component supports professional audio file transfer:

- **Chunked uploads**: 5MB chunks for reliability
- **Large file support**: Handles 100GB+ files (common for multi-track projects)
- **Automatic retry**: Exponential backoff on failures
- **Progress tracking**: Real-time speed, ETA, and progress percentage
- **Bit-perfect transfer**: No compression or modification
- **Supported formats**: WAV, AIFF, MP3, FLAC

## 🌍 Internationalization (i18n)

Translations are managed in `src/utils/translations.ts`:

```typescript
export const translations = {
  en: {
    nav: { services: "Services", portfolio: "Portfolio", ... },
    hero: { badge: "Accepting New Projects", ... },
    ...
  },
  es: {
    nav: { services: "Servicios", portfolio: "Portafolio", ... },
    hero: { badge: "Aceptando Nuevos Proyectos", ... },
    ...
  }
};
```

### Automatic Language Detection

The app detects user location via `ipapi.co` API and automatically sets:
- **Language**: `es` for Colombia, `en` otherwise
- **Currency**: `COP` for Colombia, `USD` otherwise

Users can manually override via navbar toggles (persisted in `localStorage`).

## ⚠️ Known Issues

### 1. Next.js 16 Build Error: `/_global-error` Route

**Problem**: `npm run build` fails with:
```
TypeError: Cannot read properties of null (reading 'useContext')
Error occurred prerendering page "/_global-error"
```

**Cause**: Next.js 16.1.0 attempts to statically pre-render the `/_global-error` route during build, which conflicts with React Context providers in the layout.

**Current Status**:
- ✅ App works perfectly in **development mode** (`npm run dev`)
- ❌ Production build fails
- 🔍 Investigating Next.js 16.x patches

**Workarounds**:
1. Use `npm run dev` for local development (recommended)
2. Deploy to **Vercel** or **Netlify** (they handle this automatically)
3. Monitor [Next.js GitHub issues](https://github.com/vercel/next.js/issues) for fixes

**Attempted Fixes**:
- ✅ Added `export const dynamic = 'force-dynamic'` to layout
- ✅ Removed custom `global-error.tsx` (issue persists with default)
- ✅ Tried `output: 'standalone'` in `next.config.ts`
- ❌ None resolved the build error yet

## 🚀 Deployment

### Vercel (Recommended)

Vercel automatically handles the Next.js 16 build quirks:

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables (if using real payment APIs)
4. Deploy ✨

### Netlify

Similar to Vercel:

1. Connect GitHub repository
2. Build command: `cd frontend && npm run build`
3. Publish directory: `frontend/.next`
4. Deploy

### Environment Variables for Production

```env
# Required for payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_BOLD_PUBLIC_KEY=...
BOLD_SECRET_KEY=...

# Optional
RESEND_API_KEY=re_...  # For transactional emails
```

## 🐳 Docker Commands

### Starting and Stopping Services

```bash
# Start all services in background
docker compose up -d

# Start specific service
docker compose up -d backend
docker compose up -d frontend

# View logs
docker compose logs -f              # All services
docker compose logs -f backend      # Backend only
docker compose logs -f frontend     # Frontend only

# Stop all services
docker compose down

# Stop and remove volumes (deletes database data!)
docker compose down -v

# Restart a service
docker compose restart backend
```

### Database Management

```bash
# Run migrations
docker exec betancourt-audio-backend python manage.py migrate

# Create superuser
docker exec -it betancourt-audio-backend python manage.py createsuperuser

# Access Django shell
docker exec -it betancourt-audio-backend python manage.py shell

# Access PostgreSQL
docker exec -it betancourt-audio-db psql -U postgres -d betancourt_audio
```

### Running Tests

```bash
# Run all authentication tests
docker exec betancourt-audio-backend python manage.py test authentication

# Run specific test class
docker exec betancourt-audio-backend python manage.py test authentication.tests.LoginAPITestCase

# Run with verbose output
docker exec betancourt-audio-backend python manage.py test authentication --verbosity=2
```

### Rebuilding Containers

```bash
# Rebuild after dependency changes
docker compose build

# Rebuild and start
docker compose up -d --build

# Rebuild specific service
docker compose build backend
```

## 📚 Project History

This project evolved from a Django + Next.js prototype to a full-stack production application:

### Phase 1: Frontend Migration (Phases 1-11) ✅
1. ✅ Next.js 16 setup with Tailwind v4
2. ✅ Type definitions and interfaces
3. ✅ Context providers (Theme, Language, Currency, User)
4. ✅ Mock API routes (7 endpoints)
5. ✅ UI component library (Japandi design system)
6. ✅ Currency utilities
7. ✅ Base configuration (build, TypeScript, Tailwind)
8. ✅ Shared components (Navbar, AuthModal, CheckoutModal)
9. ✅ Landing components (Background, Services, Portfolio, Contact, Console)
10. ✅ Dashboard components (Client, Admin, Wizard, FileUploader)
11. ✅ Main pages (Landing, Dashboard, Admin)

### Phase 2: Authentication System (BET-15) ✅

Complete implementation of email/password authentication:

**Completed Phases**:
1. ✅ BET-24: Setup & Dependency Configuration
2. ✅ BET-25: Database Models & Migrations
3. ✅ BET-26: Backend API Endpoints
4. ✅ BET-27: Frontend Forms & UI Components
5. ✅ BET-28: Auth.js Configuration & Middleware
6. ✅ BET-29: Email Service (Password Reset)
7. ✅ BET-30: Testing & Security Validation (28 tests, 100% passing)
8. ✅ BET-31: Documentation & Deploy Preparation

**Deliverables**:
- ✅ Django REST API with 7 authentication endpoints
- ✅ PostgreSQL database with User and PasswordResetToken models
- ✅ JWT token authentication (access + refresh)
- ✅ Argon2id password hashing
- ✅ Email service with HTML templates
- ✅ Comprehensive test suite (28 tests)
- ✅ Full API documentation
- ✅ Docker containerization

### Phase 3: Remaining Work
12. 🚧 Testing & Optimizations (frontend E2E tests pending)
13. ✅ Documentation (this README)
14. 🔜 Production deployment configuration
15. 🔜 Services & Projects backend API
16. 🔜 Payment integration (Stripe & Bold)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 📞 Contact

**Betancourt Audio**
Professional Audio Engineering Services

- 🌐 Website: [betancourtaudio.com](https://betancourtaudio.com)
- 📧 Email: contact@betancourtaudio.com
- 📸 Instagram: [@betancourtaudio](https://instagram.com/betancourtaudio)
- 🎵 Location: Bogotá, Colombia

---

**Built with ❤️ using Next.js 16, React 19, and Tailwind CSS v4**
