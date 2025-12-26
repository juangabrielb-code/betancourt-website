# BET-5: Social Authentication - Product Requirements Document

## Issue Summary

**User Story:**
Como cliente del productor musical, quiero registrarme o iniciar sesión usando mis cuentas de Google, Apple, Facebook o Microsoft, para acceder a la plataforma de forma instantánea sin tener que crear y recordar una nueva contraseña.

**Priority:** MVP (Crítico)
**Size:** S (Small)
**Status:** Planning

---

## 1. Product Overview

### 1.1 Business Context
En el negocio de la música, la agilidad es clave. El inicio de sesión social reduce la fricción de entrada, permitiendo que un cliente suba sus tracks o solicite una mezcla en segundos. Además, nos permite obtener datos verificados (nombre, correo y avatar) directamente desde el proveedor.

### 1.2 Objectives
- Implementar autenticación OAuth 2.0 con 4 proveedores: Google, Apple, Facebook, Microsoft
- Reducir fricción en el proceso de onboarding
- Obtener datos verificados automáticamente (email, nombre, avatar)
- Mantener sesiones seguras y persistentes

### 1.3 Success Metrics
- Tiempo de registro: <30 segundos desde landing page hasta dashboard
- Tasa de conversión: >80% de usuarios que inician el flujo lo completan
- Tiempo de validación de sesión: <{TARGET_VALIDATION_MS}ms
- Persistencia de sesión: {SESSION_DURATION}

---

## 2. Scope Definition

### ✅ In Scope
- **Botones de autenticación social**: Interfaz con botones "Continuar con..." para Google, Apple, Facebook y Microsoft
- **Flujo OAuth completo**: Redirección a proveedor, callback, creación de sesión
- **Manejo de sesiones**: Persistencia del usuario mediante cookies seguras con estrategia de tokens
- **Sincronización de perfil**: Creación automática de registro en base de datos con nombre, email y URL de imagen
- **Middleware de protección**: Redirección automática al /login si un usuario intenta acceder a rutas protegidas sin autenticación
- **Gestión de errores**: Mensajes amigables para cancelaciones y errores de proveedor

### ❌ Out of Scope (Future Stories)
- Login con correo y contraseña
- Vinculación de múltiples redes sociales a una misma cuenta
- Autenticación de dos factores (2FA/MFA)
- Recuperación de contraseña
- Gestión de permisos granular por roles

---

## 3. Acceptance Criteria

### AC-1: Redirección de Proveedor
**Given:** Usuario hace clic en botón de proveedor social
**When:** El botón es clickeado
**Then:** Usuario es redirigido correctamente a la página de autorización oficial del proveedor (ej. accounts.google.com)

### AC-2: Creación de Registro
**Given:** Usuario autoriza acceso por primera vez
**When:** Flujo OAuth se completa exitosamente
**Then:**
- Se crea automáticamente una entrada en la tabla de usuarios de la base de datos
- Datos almacenados incluyen: identificador único, email, nombre, URL de imagen del perfil
- Relación con proveedor OAuth queda registrada

### AC-3: Persistencia de Sesión
**Given:** Usuario ha iniciado sesión correctamente
**When:** Usuario cierra la pestaña/navegador y vuelve al sitio
**Then:**
- Sesión se mantiene activa durante el tiempo configurado (ej. {SESSION_DURATION})
- Usuario accede directamente a sus contenidos sin re-autenticarse

### AC-4: Manejo de Cancelación
**Given:** Usuario inicia flujo de autenticación
**When:** Usuario cancela la autorización en la ventana del proveedor
**Then:** Sistema muestra mensaje amigable: "El proceso de inicio de sesión fue cancelado"

### AC-5: Seguridad de Datos
**Given:** Configuración de scopes OAuth
**When:** Sistema solicita permisos al proveedor
**Then:**
- Solo solicita permisos básicos (OpenID: email, profile)
- No solicita permisos excesivos (ej. no requiere acceso a contactos, calendario, etc.)

### AC-6: Protección de Rutas
**Given:** Usuario no autenticado intenta acceder a /dashboard o /admin
**When:** Middleware valida la sesión
**Then:** Usuario es redirigido a la landing page con mensaje de login requerido

---

## 4. Test Scenarios

### Escenario 1 – Primer inicio de sesión con Google (Flujo Exitoso)
- **Given:** Soy un usuario nuevo en la landing page
- **When:** Hago clic en "Continuar con Google" y autorizo mis datos
- **Then:**
  - Soy redirigido a /dashboard
  - Veo mi foto de perfil de Google en el menú superior
  - Mi registro aparece en la base de datos

### Escenario 2 – Sesión Persistente
- **Given:** Ya inicié sesión con Facebook hace {HOURS_AGO} horas
- **When:** Cierro el navegador y vuelvo a entrar a la URL del sitio
- **Then:**
  - Sigo estando autenticado
  - Puedo ver mis proyectos sin volver a loguearme
  - No se solicita re-autenticación

### Escenario 3 – Error de Proveedor (Caso Borde)
- **Given:** El servicio de Microsoft está caído o hay un error de red
- **When:** Intento loguearme con Microsoft
- **Then:** El sistema muestra un mensaje de error: "Hubo un problema con el proveedor de identidad. Por favor intenta con otro método"

### Escenario 4 – Usuario Existente Regresa
- **Given:** Usuario ya registrado previamente con Google
- **When:** Inicia sesión nuevamente con Google
- **Then:**
  - Sistema identifica al usuario existente
  - No se crea registro duplicado
  - Usuario accede a sus datos previos

### Escenario 5 – Logout Manual
- **Given:** Usuario autenticado en dashboard
- **When:** Hace clic en botón de "Cerrar sesión"
- **Then:**
  - Sesión se invalida
  - Usuario es redirigido a landing page
  - Intentar acceder a /dashboard requiere nueva autenticación

---

## 5. Current Codebase Analysis

### Technology Stack
- **Frontend:** Next.js {NEXTJS_VERSION} (App Router) + React {REACT_VERSION} + TypeScript
- **Backend:** Django {DJANGO_VERSION} + Django REST Framework
- **Database:** PostgreSQL {PG_VERSION}
- **Deployment:** Docker Compose

### Current State
- ✅ Frontend UI estructura intacta (Navbar, landing page)
- ✅ Botón placeholder de "Login" en Navbar
- ✅ Páginas /dashboard y /admin creadas
- ❌ Sistema de autenticación completamente removido
- ❌ No hay Context API para auth
- ❌ No hay endpoints de autenticación
- ❌ No hay modelos de usuario en Django

### Key Files Requiring Modification
- `frontend/src/components/shared/Navbar.tsx` - Login button integration
- `frontend/src/app/page.tsx` - Landing page with auth modal
- `frontend/src/app/dashboard/page.tsx` - Protected route implementation
- `frontend/src/app/admin/page.tsx` - Protected admin route

### New Files to Create
- Auth configuration module
- Auth context provider
- Auth modal component
- API route handlers for authentication
- Protected route middleware
- Database schema migration files

---

## 6. Industry Research & Best Practices

### Authentication Libraries (2025)
- **Leading Solution**: Auth.js (NextAuth.js v5) - Industry standard with 2M+ weekly npm downloads and 27K+ GitHub stars
- **App Router Support**: Native Next.js App Router integration with universal authentication function
- **Provider Support**: 20+ OAuth providers supported out of the box
- **TypeScript**: First-class TypeScript support with comprehensive type definitions

### Session Management Strategies
- **JWT Sessions**: {JWT_VALIDATION_TIME}ms validation, infinite horizontal scaling, Edge Runtime compatible
- **Database Sessions**: {DB_SESSION_OVERHEAD}ms overhead, immediate revocation capability, detailed audit trails
- **Cache-Based Sessions**: {CACHE_LOOKUP_TIME}ms lookup, faster than database, requires additional infrastructure

### Security Standards
- **OWASP Compliance**: HttpOnly, Secure, SameSite cookies with `__Host-` prefix
- **Token Lifespan**: Short-lived tokens ({SHORT_TOKEN_DURATION}) with automatic refresh for balance between security and UX
- **Data Access Verification**: Never rely solely on middleware - verify authentication at every data access point (CVE-2025-29927)

---

## 7. Technical Decisions

### Decision 1: Authentication Library
**Selected:** Auth.js (NextAuth.js v5)

**Rationale:**
- Industry standard with proven track record and extensive community support
- Native integration with Next.js App Router architecture
- Built-in provider support for all required OAuth platforms (Google, Apple, Facebook, Microsoft)
- Comprehensive documentation and active maintenance
- Minimal configuration required for standard OAuth flows
- Aligned with "S" (Small) size estimate

### Decision 2: Session Management Strategy
**Selected:** JWT-based stateless sessions

**Rationale:**
- Performance: {JWT_VALIDATION_TIME}ms validation vs {DB_SESSION_OVERHEAD}ms for database sessions
- Horizontal scalability without database lookups
- Compatible with Edge Runtime for future optimization
- Meets requirement for {SESSION_DURATION} persistence
- Optimal for MVP with growth projection
- Limitation: Cannot revoke until expiration (mitigated with short token duration + refresh strategy)

### Decision 3: Backend Integration Architecture
**Selected:** Shared database with ORM adapter

**Rationale:**
- Single source of truth for user data
- Automatic user synchronization on OAuth events
- Django can query same tables for backend operations
- Complete audit trail of authentication events
- Eliminates data duplication and synchronization issues
- Consideration: Two ORMs accessing same database requires coordination

### Decision 4: Database Schema Design
**Selected:** Standard OAuth authentication schema

**Rationale:**
- Battle-tested schema design maintained by community
- Supports multiple providers per user (future extensibility)
- Includes tables for: Users, OAuth Accounts, Sessions, Verification Tokens
- Compatible with both frontend and backend ORM systems
- Extensible for future authentication features

---

## 8. Technical Requirements

### 8.1 Authentication Requirements
- **OAuth Compliance**: Full OAuth 2.0 / OpenID Connect standard compliance
- **Supported Providers**: Google, Apple, Facebook, Microsoft
- **Scope Requests**: Minimal scopes only - email and profile information
- **Session Duration**: {SESSION_DURATION} (e.g., 30 days)
- **Session Refresh**: Automatic refresh every {REFRESH_INTERVAL} (e.g., 24 hours)
- **Redirect Handling**: Proper handling of OAuth callback flows with state validation

### 8.2 Security Requirements
- **OWASP Compliance**: Follow OWASP authentication best practices
- **Cookie Configuration**:
  - HttpOnly flag enabled
  - Secure flag enabled (HTTPS only)
  - SameSite attribute set appropriately
  - Cookie prefix `__Host-` for additional security
- **Session Validation**: Verify session at every protected data access point
- **CSRF Protection**: Built-in CSRF token validation for state-changing operations
- **Token Storage**: Secure storage mechanism for refresh and access tokens
- **Secret Management**: Environment-based secret configuration, never hardcoded

### 8.3 Performance Requirements
- **Session Validation Time**: <{TARGET_VALIDATION_MS}ms (e.g., 10ms)
- **OAuth Redirect Flow**: Complete flow in <{TARGET_OAUTH_FLOW_S}s (e.g., 3 seconds)
- **Horizontal Scalability**: Session strategy must support multiple server instances
- **Database Query Optimization**: Minimize database lookups during session validation

### 8.4 Data Requirements
- **User Profile Synchronization**: Automatic sync of profile data on each login
- **Required Fields**:
  - Unique user identifier
  - Email address
  - Display name
  - Profile image URL
- **Optional Fields**:
  - Email verification timestamp
  - Account creation timestamp
  - Last update timestamp
- **Data Retention**: Follow GDPR and data privacy regulations
- **Provider Linking**: Store relationship between user and OAuth provider account

### 8.5 User Experience Requirements
- **Error Messages**: User-friendly, translatable error messages for common scenarios
- **Loading States**: Clear visual feedback during OAuth redirect flow
- **Cancel Handling**: Graceful handling when user cancels authorization
- **Multi-language Support**: Integration with existing language context system
- **Accessibility**: WCAG 2.1 AA compliance for authentication UI components

---

## 9. Implementation Guidance for AI Assistants

### 9.1 Dependencies to Install
The implementation requires installing authentication library packages, database ORM packages, and their corresponding TypeScript type definitions. Install the latest stable versions compatible with the existing Next.js and React versions.

**Required Packages:**
- Authentication framework for Next.js (latest beta/stable)
- Database adapter for authentication library
- Database client and ORM tool
- TypeScript type definitions

### 9.2 Environment Configuration
Set up environment variables for:
- **Database Connection**: {DATABASE_URL} format for PostgreSQL connection
- **Authentication Secret**: {AUTH_SECRET} - generate using secure random generator
- **Application URLs**: {NEXTAUTH_URL} for callback redirects
- **OAuth Provider Credentials**: For each provider (Google, Apple, Facebook, Microsoft):
  - Client ID: {PROVIDER_CLIENT_ID}
  - Client Secret: {PROVIDER_CLIENT_SECRET}
  - Additional provider-specific configs (e.g., tenant ID for Microsoft)

### 9.3 Database Schema Setup
Initialize database schema with tables for:
- **Users Table**: Store user profile information with unique email constraint
- **Accounts Table**: Store OAuth provider linkage with unique constraint on provider + provider account ID
- **Sessions Table**: Optional for database sessions (can be omitted with JWT strategy)
- **Verification Tokens Table**: For email verification flows

Use database migration tool to:
1. Generate initial migration from schema definition
2. Apply migration to development database
3. Verify schema creation

### 9.4 Authentication Configuration
Create authentication configuration module with:
- **Provider Configuration**: Configure each OAuth provider (Google, Apple, Facebook, Microsoft) with:
  - Client credentials from environment variables
  - Appropriate scopes (minimal: email, profile)
  - Authorization parameters (prompt, access_type, response_type)
- **Session Configuration**:
  - Strategy: {SESSION_STRATEGY} (e.g., JWT)
  - Max age: {SESSION_DURATION}
  - Update interval: {REFRESH_INTERVAL}
- **Callbacks**:
  - JWT callback: Extend token with user ID and role
  - Session callback: Add user data to session object
  - Authorization callback: Implement route protection logic
- **Pages Configuration**:
  - Custom sign-in page path
  - Custom error page path

### 9.5 Protected Route Middleware
Implement middleware that:
- Validates user session on every request to protected routes
- Redirects unauthenticated users to landing page
- Allows authenticated users to proceed
- Matches patterns: `/dashboard/*`, `/admin/*`
- Excludes patterns: `/api/*`, `/_next/*`, static assets

### 9.6 Frontend Components

#### Auth Context Provider
Create context provider that:
- Wraps session management from authentication library
- Exposes session state, authentication status, sign-in, and sign-out functions
- Provides loading states during session hydration
- Integrates with existing context providers (Theme, Language, Currency)

#### Auth Modal Component
Create modal component with:
- Four social login buttons (Google, Apple, Facebook, Microsoft)
- Appropriate brand styling and icons for each provider
- Loading states during OAuth redirect
- Error message display area
- Cancel/close functionality
- Responsive design matching existing UI system

#### Navbar Integration
Update navigation bar to:
- Show login button for unauthenticated users
- Show user profile (avatar, name) for authenticated users
- Navigate to appropriate dashboard based on user role (admin vs client)
- Integrate with auth modal for login flow

#### Dashboard Pages
Update protected pages to:
- Check authentication status on mount
- Redirect if unauthenticated
- Display loading state during session verification
- Fetch and display user-specific data after authentication confirmed
- Provide logout functionality

### 9.7 Backend Integration
Create Django models that:
- Map to authentication database tables
- Use `managed = False` to prevent Django from modifying schema
- Provide read-only access to user data for backend operations
- Include appropriate relationships and field types

Register models in Django admin for inspection (optional).

Update Django settings to include new application in `INSTALLED_APPS`.

---

## 10. Reference Implementation Patterns

### Pattern 1: OAuth Provider Configuration
```
Configure OAuth provider with:
- Provider name: {PROVIDER_NAME} (e.g., "google", "apple", "facebook", "microsoft-entra-id")
- Client credentials from environment:
  - Client ID: {PROVIDER_CLIENT_ID}
  - Client Secret: {PROVIDER_CLIENT_SECRET}
- Authorization parameters:
  - Scope: "openid email profile"
  - Prompt: "consent" (for re-authorization)
  - Access type: "offline" (for refresh tokens)
  - Response type: "code" (authorization code flow)

Example implementation may vary based on chosen authentication library.
```

### Pattern 2: Session Management
```
Configure session with:
- Strategy: {SESSION_STRATEGY} (recommended: "jwt" for stateless)
- Maximum age: {SESSION_DURATION} in seconds (e.g., 30 * 24 * 60 * 60 for 30 days)
- Update age: {REFRESH_INTERVAL} in seconds (e.g., 24 * 60 * 60 for daily refresh)
- Cookie settings:
  - httpOnly: true
  - secure: true (production only)
  - sameSite: "lax" or "strict"
  - path: "/"

Example implementation may vary based on chosen authentication library.
```

### Pattern 3: Protected Route Middleware
```
Middleware logic:
1. Extract session/token from request
2. Verify session validity
3. Check if current path requires authentication
   - Protected patterns: /dashboard/*, /admin/*
   - Public patterns: /, /api/*, /_next/*, /favicon.ico
4. If protected route AND not authenticated:
   - Redirect to sign-in page (e.g., "/")
5. If protected route AND authenticated:
   - Allow request to proceed
6. If public route:
   - Allow request to proceed

Example implementation may vary based on framework middleware system.
```

### Pattern 4: User Data Synchronization
```
On successful OAuth callback:
1. Extract user profile from provider response:
   - Unique identifier (provider-specific)
   - Email address
   - Display name
   - Profile image URL
2. Check if user exists in database (by email or provider ID)
3. If new user:
   - Create user record with profile data
   - Create account record linking user to OAuth provider
   - Generate session token
4. If existing user:
   - Update profile data if changed
   - Update last login timestamp
   - Generate session token
5. Store session in cookie or database
6. Redirect to {CALLBACK_URL} (e.g., "/dashboard")

Example implementation may vary based on chosen authentication library adapter.
```

### Pattern 5: Social Login Button Handler
```
On social login button click:
1. Set loading state for specific provider
2. Clear any previous error messages
3. Invoke sign-in function with:
   - Provider identifier: {PROVIDER_NAME}
   - Callback URL: {CALLBACK_URL}
   - Redirect: true (for full page redirect)
4. Handle errors:
   - Network errors: "No se pudo conectar con {PROVIDER_NAME}"
   - Cancellation: "El proceso de inicio de sesión fue cancelado"
   - Provider errors: "Hubo un problema con el proveedor de identidad"
5. Clear loading state

Example implementation may vary based on UI framework and state management.
```

---

## 11. Environment & Configuration

### 11.1 Required Environment Variables

**Database Configuration:**
- `DATABASE_URL`: PostgreSQL connection string
  - Format: `postgresql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}`
  - Example: `postgresql://postgres:postgres@localhost:5432/betancourt_audio`

**Authentication Configuration:**
- `AUTH_SECRET`: Secret key for signing tokens
  - Generate with: `openssl rand -base64 32`
  - Must be kept secure and never committed to version control
- `NEXTAUTH_URL`: Application base URL
  - Development: `http://localhost:3000`
  - Production: `https://your-domain.com`

**OAuth Provider Credentials:**

*Google:*
- `AUTH_GOOGLE_ID`: Google OAuth client ID
- `AUTH_GOOGLE_SECRET`: Google OAuth client secret

*Facebook:*
- `AUTH_FACEBOOK_ID`: Facebook app ID
- `AUTH_FACEBOOK_SECRET`: Facebook app secret

*Apple:*
- `AUTH_APPLE_ID`: Apple service ID
- `AUTH_APPLE_SECRET`: Apple private key

*Microsoft:*
- `AUTH_MICROSOFT_ENTRA_ID_ID`: Microsoft client ID
- `AUTH_MICROSOFT_ENTRA_ID_SECRET`: Microsoft client secret
- `AUTH_MICROSOFT_ENTRA_ID_TENANT_ID`: Tenant ID (use "common" for multi-tenant)

### 11.2 OAuth Provider Setup Instructions

**Google Cloud Console:**
1. Create project: {PROJECT_NAME}
2. Enable Google+ API or Google Identity services
3. Create OAuth 2.0 credentials
4. Configure authorized redirect URI: `{APP_URL}/api/auth/callback/google`
5. Copy client ID and secret to environment variables

**Meta for Developers (Facebook):**
1. Create app: {APP_NAME}
2. Add "Facebook Login" product
3. Configure valid OAuth redirect URI: `{APP_URL}/api/auth/callback/facebook`
4. Set app to live mode after testing
5. Copy app ID and secret to environment variables

**Apple Developer:**
1. Create Services ID
2. Configure "Sign in with Apple"
3. Add return URL: `{APP_URL}/api/auth/callback/apple`
4. Generate private key and download
5. Copy service ID and key to environment variables

**Azure Portal (Microsoft):**
1. Register application in Azure AD
2. Add platform: Web
3. Configure redirect URI: `{APP_URL}/api/auth/callback/azure-ad`
4. Create client secret
5. Copy application (client) ID and secret to environment variables

### 11.3 Infrastructure Requirements
- **Frontend Deployment**: Node.js environment compatible with Next.js
- **Database**: PostgreSQL instance (version {PG_VERSION} or higher)
- **SSL/TLS**: HTTPS certificates for production (required for Secure cookies)
- **Domain**: Registered domain for production OAuth callbacks

---

## 12. Testing & Validation

### 12.1 Functional Testing Checklist

**OAuth Flow Testing:**
- [ ] Google login redirects to accounts.google.com
- [ ] Facebook login redirects to facebook.com/login
- [ ] Apple login redirects to appleid.apple.com
- [ ] Microsoft login redirects to login.microsoftonline.com
- [ ] Successful authorization redirects to dashboard
- [ ] User data appears in database after first login
- [ ] Repeated login doesn't create duplicate user records

**Session Management Testing:**
- [ ] Session persists after browser close
- [ ] Session persists after {SESSION_DURATION}
- [ ] Session refresh occurs every {REFRESH_INTERVAL}
- [ ] Logout clears session completely
- [ ] Expired sessions redirect to login

**Route Protection Testing:**
- [ ] Unauthenticated access to /dashboard redirects to home
- [ ] Unauthenticated access to /admin redirects to home
- [ ] Authenticated users can access /dashboard
- [ ] Admin users can access /admin
- [ ] Public routes remain accessible without authentication

**Error Handling Testing:**
- [ ] Cancel OAuth flow shows friendly message
- [ ] Network error shows appropriate error message
- [ ] Provider downtime shows alternative options
- [ ] Invalid credentials handled gracefully
- [ ] Session validation errors don't crash application

### 12.2 Security Testing Checklist
- [ ] Cookies have HttpOnly flag set
- [ ] Cookies have Secure flag in production
- [ ] Cookies have SameSite attribute configured
- [ ] Session tokens cannot be extracted via JavaScript
- [ ] CSRF protection active on state-changing requests
- [ ] OAuth state parameter validated on callback
- [ ] No sensitive data exposed in client-side code
- [ ] Environment secrets not committed to repository
- [ ] SQL injection protection verified
- [ ] XSS protection verified

### 12.3 Performance Testing
- [ ] Session validation completes in <{TARGET_VALIDATION_MS}ms
- [ ] OAuth redirect flow completes in <{TARGET_OAUTH_FLOW_S}s
- [ ] Database queries optimized (indexed columns used)
- [ ] No N+1 query problems in user data fetching
- [ ] Application handles {CONCURRENT_USERS} concurrent users

### 12.4 User Experience Testing
- [ ] Loading states display during OAuth redirect
- [ ] Error messages display in user's language (EN/ES)
- [ ] Buttons show appropriate disabled states
- [ ] Modal can be closed via backdrop click or X button
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader announces authentication state changes
- [ ] Mobile responsive design works on all breakpoints

---

## 13. Success Criteria

### Functional Criteria
- ✅ All 4 OAuth providers working (Google, Apple, Facebook, Microsoft)
- ✅ Users automatically created in PostgreSQL on first login
- ✅ Sessions persist for {SESSION_DURATION}
- ✅ Protected routes redirect unauthenticated users
- ✅ User profile data (name, email, image) displayed in UI
- ✅ Friendly error messages on auth cancellation
- ✅ No excessive OAuth scopes requested (only email, profile)
- ✅ Django can read user data from shared database
- ✅ All acceptance criteria (AC-1 through AC-6) met
- ✅ All test scenarios passing

### Non-Functional Criteria
- ✅ Session validation: <{TARGET_VALIDATION_MS}ms
- ✅ OAuth flow: <{TARGET_OAUTH_FLOW_S}s end-to-end
- ✅ OWASP security standards compliance
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ No security vulnerabilities in authentication flow
- ✅ Horizontal scalability supported (stateless sessions)

### Documentation Criteria
- ✅ Environment variables documented in .env.example
- ✅ OAuth setup instructions complete for all providers
- ✅ README updated with authentication section
- ✅ Code comments explain critical security decisions

---

## 14. Risk Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| OAuth app approval delays from providers | High | Medium | Start with Google (fastest approval). Use development mode for initial testing. Have backup timeline. |
| Prisma/Django ORM schema conflicts | Medium | Low | Use Django's `managed = False` for auth tables. Document schema ownership clearly. Test migrations in dev first. |
| Session token size exceeding limits | Low | Low | Keep JWT payload minimal (<4KB). Only include essential user data. Store extended data in database. |
| OAuth provider downtime | Medium | Low | Show clear error message. Allow users to try alternative providers. Implement retry logic with exponential backoff. |
| Database migration conflicts | Medium | Low | Test all migrations in development environment. Use feature flags for gradual rollout. Have rollback plan. |
| Security vulnerabilities in auth flow | Critical | Low | Follow OWASP guidelines. Use battle-tested library (Auth.js). Conduct security review before production. |
| Performance degradation under load | Medium | Medium | Use stateless JWT sessions. Implement caching where appropriate. Load test before launch. |
| GDPR compliance issues | High | Low | Implement proper data retention policies. Provide user data deletion endpoint. Document data processing. |

---

## 15. Out of Scope (Future Enhancements)

The following features are explicitly excluded from this implementation and may be considered for future iterations:

- **Email/Password Authentication**: Traditional username/password login system
- **Multi-Provider Account Linking**: Allow users to link multiple OAuth providers to single account
- **Two-Factor Authentication (2FA)**: Additional security layer with TOTP or SMS
- **Password Recovery Flow**: Email-based password reset (only relevant if email/password auth added)
- **Social Sharing Permissions**: Extended OAuth scopes for posting to social media
- **Role-Based Access Control (RBAC)**: Granular permissions system beyond basic CLIENT/ADMIN
- **Account Deletion Flow**: User-initiated account deletion with data export
- **Login Activity History**: Detailed audit log of all login attempts
- **Magic Link Authentication**: Passwordless email-based authentication
- **Biometric Authentication**: Fingerprint/Face ID integration

---

## Appendix A: Placeholder Reference

This document uses placeholders to maintain flexibility and non-deterministic implementation guidance. Below is a reference of all placeholders used:

| Placeholder | Example Value | Description |
|------------|---------------|-------------|
| `{SESSION_DURATION}` | `30 days` or `2592000 seconds` | Total session validity period |
| `{REFRESH_INTERVAL}` | `24 hours` or `86400 seconds` | How often to refresh session token |
| `{TARGET_VALIDATION_MS}` | `10ms` | Target session validation time |
| `{TARGET_OAUTH_FLOW_S}` | `3s` | Target OAuth redirect flow completion time |
| `{JWT_VALIDATION_TIME}` | `8-10ms` | JWT token validation performance |
| `{DB_SESSION_OVERHEAD}` | `30-100ms` | Database session lookup overhead |
| `{CACHE_LOOKUP_TIME}` | `5-20ms` | Cache-based session lookup time |
| `{SHORT_TOKEN_DURATION}` | `60s` | Short-lived token lifespan |
| `{DATABASE_URL}` | `postgresql://user:pass@host:port/db` | PostgreSQL connection string |
| `{AUTH_SECRET}` | Generated via `openssl rand -base64 32` | Secret for signing tokens |
| `{NEXTAUTH_URL}` | `http://localhost:3000` | Application base URL |
| `{PROVIDER_NAME}` | `google`, `apple`, `facebook`, `microsoft-entra-id` | OAuth provider identifier |
| `{PROVIDER_CLIENT_ID}` | Provider-specific client ID | OAuth client identifier |
| `{PROVIDER_CLIENT_SECRET}` | Provider-specific secret | OAuth client secret |
| `{CALLBACK_URL}` | `/dashboard` | Post-authentication redirect |
| `{APP_URL}` | `https://betancourt-audio.com` | Full application URL |
| `{PROJECT_NAME}` | `Betancourt Audio` | OAuth app project name |
| `{APP_NAME}` | `Betancourt Audio` | OAuth app name |
| `{NEXTJS_VERSION}` | `16.1.0` | Next.js version |
| `{REACT_VERSION}` | `19` | React version |
| `{DJANGO_VERSION}` | `5.2.9` | Django version |
| `{PG_VERSION}` | `16` | PostgreSQL version |
| `{SESSION_STRATEGY}` | `jwt` | Session storage strategy |
| `{CONCURRENT_USERS}` | `100` | Concurrent users for load testing |
| `{HOURS_AGO}` | `12` | Hours since last login for testing |

---

**Status:** ✅ READY FOR IMPLEMENTATION
**Document Type:** Product Requirements Document (PRD)
**Last Updated:** 2025-01-25
**Approach:** Hybrid - Natural language requirements with reference patterns and placeholders
