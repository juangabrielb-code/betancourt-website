# BET-15: Identidad Tradicional (Email + Contraseña) - Plan de Solución

## Issue Summary

**User Story:**
Como cliente del productor musical, quiero registrarme e iniciar sesión utilizando mi correo electrónico y una contraseña segura, para tener una cuenta independiente de mis redes sociales y mantener el acceso a mis proyectos de forma privada.

**Priority:** MVP (Crítico)
**Size:** M (Medium)
**Status:** Planning

---

## 1. Product Overview

### 1.1 Business Context

El inicio de sesión con email y contraseña es el método de autenticación universal que garantiza acceso independiente de las redes sociales. Proporciona un canal de comunicación directo (email) para notificaciones de entrega de archivos, marketing y alertas de pago. Es fundamental para el flujo de recuperación de contraseña y para usuarios que prefieren privacidad.

### 1.2 Objectives

- Implementar registro con email y contraseña segura
- Implementar login con validación de credenciales
- Garantizar seguridad mediante hashing robusto
- Proporcionar validación de fortaleza de contraseña
- Implementar flujo de recuperación de contraseña
- Prevenir ataques comunes (timing attacks, enumeration, brute force)

### 1.3 Success Metrics

- Tiempo de registro: <{REGISTRATION_TIME_TARGET} segundos desde landing page hasta dashboard
- Tasa de conversión: >{CONVERSION_RATE_TARGET}% de usuarios que inician el registro lo completan
- Seguridad: 0 contraseñas almacenadas en texto plano
- Tasa de éxito en recuperación de contraseña: >{PASSWORD_RESET_SUCCESS_RATE}%
- Tiempo de validación de sesión: <{SESSION_VALIDATION_TIME}ms

---

## 2. Scope Definition

### ✅ In Scope

- **Formulario de Registro**: Captura de nombre, email y contraseña con confirmación
- **Formulario de Login**: Validación de credenciales contra base de datos
- **Hashing Seguro**: Uso de algoritmo moderno de hashing para nunca guardar contraseñas en texto plano
- **Validación de Campos**: Verificación de formato de email y complejidad de contraseña
- **Prevención de Duplicados**: No permitir emails duplicados
- **Flujo de Recuperación**: Pantalla "Olvidé mi contraseña" con envío de token por email
- **Manejo de Sesiones**: Persistencia mediante cookies seguras con estrategia de tokens
- **Rate Limiting**: Protección contra brute force attacks
- **Mensajes de Error Seguros**: Mensajes genéricos para prevenir enumeration

### ❌ Out of Scope (Future Stories)

- Verificación de email por código (OTP)
- Cambio de email una vez registrado
- Two-Factor Authentication (2FA)
- Login con username (solo email)
- Social account linking
- Account deletion flow

---

## 3. Acceptance Criteria

### AC-1: Validación de Fortaleza de Contraseña
**Given:** Usuario intenta registrarse con contraseña débil
**When:** Ingresa contraseña que no cumple requisitos mínimos
**Then:** Sistema rechaza y muestra requisitos específicos configurados en {PASSWORD_REQUIREMENTS}

### AC-2: Prevención de Duplicados
**Given:** Email ya existe en la base de datos
**When:** Usuario intenta registrarse con ese email
**Then:** Sistema muestra error indicando que el email ya está registrado

### AC-3: Manejo de Errores Crípticos en Login
**Given:** Usuario intenta login con email que no existe o contraseña incorrecta
**When:** Envía el formulario
**Then:** Sistema muestra mensaje genérico sin especificar cuál campo está incorrecto (prevención de enumeration)

### AC-4: Hashing Seguro
**Given:** Usuario se registra con contraseña
**When:** La contraseña llega al backend
**Then:** Se hashea con algoritmo moderno antes de almacenamiento, nunca se guarda en texto plano

### AC-5: Sesión Automática Post-Registro
**Given:** Usuario completa registro exitosamente
**When:** Se crea la cuenta
**Then:** Usuario queda autenticado automáticamente y es redirigido a dashboard

### AC-6: Flujo de Recuperación de Contraseña
**Given:** Usuario olvidó su contraseña
**When:** Ingresa email válido en formulario de recuperación
**Then:**
- Sistema genera token único y seguro
- Email enviado si la cuenta existe
- Mismo mensaje mostrado independientemente de si email existe (anti-enumeration)
- Token expira después de {PASSWORD_RESET_TOKEN_EXPIRY}

---

## 4. Test Scenarios

### Escenario 1 – Registro exitoso
- **Given:** Usuario ingresa email válido, nombre y contraseña que cumple requisitos
- **When:** Hace clic en botón de registro
- **Then:**
  - Registro creado en base de datos
  - Password hasheada con algoritmo seguro
  - Usuario autenticado automáticamente
  - Redirigido a dashboard
  - Cookie de sesión seteada correctamente

### Escenario 2 – Login fallido por contraseña errónea
- **Given:** Existe usuario registrado en el sistema
- **When:** Intenta login con contraseña incorrecta
- **Then:**
  - Sistema muestra mensaje genérico de error
  - No revela si el problema es email o contraseña
  - No permite acceso

### Escenario 3 – Registro con email duplicado
- **Given:** Email ya existe en base de datos
- **When:** Usuario intenta registrarse con ese email
- **Then:**
  - Sistema rechaza el registro
  - Muestra mensaje indicando que email ya está registrado
  - Ofrece opciones de iniciar sesión o recuperar contraseña

### Escenario 4 – Contraseña débil rechazada
- **Given:** Usuario intenta registrarse con contraseña que no cumple requisitos
- **When:** Envía el formulario
- **Then:**
  - Sistema rechaza
  - Muestra requisitos configurados de contraseña
  - No envía datos al backend hasta que validación pase

### Escenario 5 – Recuperación de contraseña
- **Given:** Usuario no recuerda su contraseña
- **When:** Ingresa email en formulario de recuperación
- **Then:**
  - Sistema genera token seguro
  - Email enviado con link de reset
  - Mismo mensaje mostrado independientemente de si email existe
  - Token expira después del tiempo configurado
  - Usuario puede establecer nueva contraseña usando el link

### Escenario 6 – Rate Limiting en Login
- **Given:** Usuario intenta login múltiples veces con credenciales incorrectas
- **When:** Excede el límite de intentos configurado en {MAX_LOGIN_ATTEMPTS}
- **Then:**
  - Sistema bloquea temporalmente por {LOGIN_BLOCK_DURATION}
  - Muestra mensaje indicando bloqueo temporal

---

## 5. Current Codebase Analysis

### Technology Stack
- **Frontend:** Next.js {NEXTJS_VERSION} (App Router) + React {REACT_VERSION} + TypeScript
- **Backend:** Django {DJANGO_VERSION} + Django REST Framework
- **Database:** PostgreSQL {PG_VERSION}
- **Deployment:** Docker Compose

### Current State
- ✅ Frontend UI estructura básica (Navbar, landing page)
- ✅ Backend Django configurado con PostgreSQL
- ✅ Django REST Framework instalado
- ✅ CORS configurado correctamente
- ✅ Django's contrib.auth disponible
- ✅ Password validators de Django configurados
- ❌ NO hay Auth.js instalado en frontend
- ❌ NO hay modelos de usuario personalizados
- ❌ NO hay endpoints de autenticación
- ❌ NO hay formularios de login/registro

### Key Files Requiring Modification

- `frontend/src/app/page.tsx` - Landing page con modales de auth
- `frontend/src/components/shared/Navbar.tsx` - Login/register buttons
- `frontend/src/app/dashboard/page.tsx` - Protected route
- `backend/config/settings.py` - Configuración de auth
- `backend/config/urls.py` - URLs de auth endpoints

### New Files to Create

**Frontend:**
- Auth.js route handler y configuración
- Componentes de formularios (Register, Login, ForgotPassword, ResetPassword)
- Modal contenedor de autenticación
- Context provider para auth state
- Middleware para protección de rutas

**Backend:**
- Nueva app Django para autenticación
- Modelos de Usuario y tokens de reset
- Serializers para API
- ViewSets para endpoints
- Services para lógica de negocio (email, tokens)
- Validators personalizados

---

## 6. Industry Research & Best Practices

### Authentication Libraries (2025)

**Frontend:**
- **Leading Solution**: Auth.js (NextAuth.js v5) con Credentials Provider para autenticación email/password
- **Session Strategy**: JWT stateless para escalabilidad horizontal
- **Cookie Security**: HttpOnly, Secure, SameSite flags para prevenir XSS y CSRF

**Backend:**
- **Django REST Framework**: Framework robusto para APIs REST
- **Modern Password Hashing**: Algoritmo resistente a ataques GPU/ASIC
- **Token Management**: Generación segura de tokens para password reset

### Security Best Practices (2025)

**Password Storage:**
- **Modern Hashing Algorithm**: Uso de algoritmo ganador de competencias de seguridad
- **Automatic Salting**: Salt único generado automáticamente por usuario
- **Computational Cost**: Parámetros configurados para balance entre seguridad y performance

**Session Management:**
- **Stateless Tokens**: JWT para escalabilidad sin estado en servidor
- **Secure Cookies**: HttpOnly previene acceso desde JavaScript
- **Token Lifecycle**: Access tokens de corta duración, refresh tokens de larga duración
- **Cookie Attributes**: Secure (HTTPS only), SameSite (CSRF protection)

**Rate Limiting:**
- **Login Attempts**: Límite de {MAX_LOGIN_ATTEMPTS} intentos cada {LOGIN_RATE_WINDOW}
- **Registration**: Límite de {MAX_REGISTRATION_ATTEMPTS} registros por {REGISTRATION_RATE_WINDOW} por IP
- **Password Reset**: Límite de {MAX_RESET_ATTEMPTS} intentos por {RESET_RATE_WINDOW} por email

**Anti-Enumeration:**
- **Generic Errors**: Mensajes que no revelan si email existe o no
- **Timing-Safe Operations**: Prevenir timing attacks en comparaciones
- **Consistent Response Times**: Mismo tiempo de respuesta para usuarios existentes y no existentes

---

## 7. Technical Decisions

### Decision 1: Password Hashing Algorithm
**Selected:** Algoritmo moderno resistente a ataques (tipo ganador de competencia de hashing)

**Rationale:**
- Resistente a ataques con GPU/ASIC
- Protección contra side-channel attacks
- Recomendado por OWASP (2025)
- Soporte nativo en framework backend
- Superior en seguridad comparado con algoritmos legacy

**Parameters:**
- Memory cost: {HASH_MEMORY_COST}
- Time cost: {HASH_TIME_COST}
- Parallelism: {HASH_PARALLELISM}

### Decision 2: Session Management Strategy
**Selected:** JWT tokens en HttpOnly cookies (stateless)

**Rationale:**
- **Stateless**: No requiere almacenamiento de sesiones en base de datos
- **Escalable**: Soporte para horizontal scaling sin problemas
- **Seguro**: HttpOnly cookies previenen XSS attacks
- **Performance**: Validación de token en <{SESSION_VALIDATION_TIME}ms
- **Compatible**: Integración nativa con frameworks frontend y backend

**Token Configuration:**
- Access token lifetime: {ACCESS_TOKEN_LIFETIME}
- Refresh token lifetime: {REFRESH_TOKEN_LIFETIME}
- Cookie attributes: HttpOnly, Secure, SameSite={SAMESITE_POLICY}

### Decision 3: Email Service
**Selected:** Framework de email integrado + proveedor de email transaccional

**Rationale:**
- Framework backend tiene sistema de email robusto y probado
- Proveedores modernos ofrecen tier gratuito suficiente para MVP
- Templates HTML personalizables
- Tracking y analytics de emails
- Fácil testing en desarrollo (console backend)
- Escalabilidad para producción

### Decision 4: Password Requirements
**Selected:** Balance entre seguridad y usabilidad siguiendo guías NIST

**Requirements:**
- Longitud mínima: {PASSWORD_MIN_LENGTH} caracteres
- Al menos {PASSWORD_MIN_UPPERCASE} letra mayúscula
- Al menos {PASSWORD_MIN_LOWERCASE} letra minúscula
- Al menos {PASSWORD_MIN_DIGITS} dígito
- Opcional: Caracteres especiales (no obligatorios para evitar frustración)

**Not Required:**
- NO rotación periódica (NIST desaconseja)
- NO complejidad excesiva que cause password reuse

**Rationale:**
- Balance entre seguridad y experiencia de usuario
- Alineado con NIST Digital Identity Guidelines (2025)
- Previene contraseñas débiles sin crear fricción excesiva
- Validación en frontend Y backend para seguridad en capas

### Decision 5: User Model Architecture
**Selected:** Modelo personalizado extendiendo clase abstracta de usuario del framework

**Rationale:**
- Best practice iniciar con modelo custom desde el principio
- Flexibilidad para agregar campos en el futuro sin migraciones complejas
- Permite usar email como identificador principal
- Compatible con admin panel del framework
- Integración fluida con REST API

**Fields Strategy:**
- Email como campo único e identificador principal
- Username generado automáticamente del email
- Campos opcionales para personalización (nombre, apellido)
- Timestamps automáticos (created, last_login)
- Flags de estado (is_active, is_staff, is_superuser)

---

## 8. Technical Requirements

### 8.1 Authentication Requirements

**Registration Flow:**
- Validar formato de email según estándares RFC
- Validar fortaleza de contraseña según {PASSWORD_REQUIREMENTS}
- Confirmar que contraseña y confirmación coinciden
- Prevenir registro de emails duplicados
- Hashear contraseña con algoritmo moderno antes de almacenar
- Crear sesión automáticamente después de registro exitoso
- Opcional: Enviar email de bienvenida

**Login Flow:**
- Validar credenciales contra base de datos
- Usar comparación timing-safe para passwords
- Aplicar rate limiting según {MAX_LOGIN_ATTEMPTS} por {LOGIN_RATE_WINDOW}
- Mostrar mensajes de error genéricos para prevenir enumeration
- Crear sesión con token JWT
- Setear cookies con flags de seguridad (HttpOnly, Secure, SameSite)
- Actualizar timestamp de last_login

**Password Reset Flow:**
- Generar token único y criptográficamente seguro
- Token expira después de {PASSWORD_RESET_TOKEN_EXPIRY}
- Enviar email con link de reset
- Validar token al momento de reset
- Permitir establecer nueva contraseña que cumpla requisitos
- Invalidar token inmediatamente después de uso exitoso
- NO revelar si email existe en sistema (anti-enumeration)
- Prevenir reuso del mismo token

### 8.2 Security Requirements

**Password Security:**
- Hashear todas las contraseñas con algoritmo moderno
- Salt automático y único por usuario
- Nunca almacenar contraseñas en texto plano
- Nunca logear contraseñas en ningún nivel del sistema
- No transmitir contraseñas excepto durante autenticación

**Session Security:**
- JWT firmado con algoritmo seguro (HS256 o superior)
- Secret key de al menos {JWT_SECRET_MIN_LENGTH} bits de entropía
- Cookies con HttpOnly flag (JavaScript no puede acceder)
- Cookies con Secure flag en producción (HTTPS only)
- Cookies con SameSite={SAMESITE_POLICY} (CSRF protection)
- CSRF protection habilitado en framework

**API Security:**
- Rate limiting en todos los endpoints de autenticación
- HTTPS obligatorio en producción
- CORS configurado estrictamente
- Validación de input en todos los campos
- Protección contra SQL injection (uso de ORM)
- Protección contra XSS (auto-escaping en framework frontend)
- Headers de seguridad apropiados (CSP, X-Frame-Options, etc.)

### 8.3 Performance Requirements

- **Password Hashing**: <{HASH_MAX_TIME}ms por operación
- **Session Validation**: <{SESSION_VALIDATION_TIME}ms
- **Login Flow**: <{LOGIN_FLOW_MAX_TIME}s end-to-end
- **Registration Flow**: <{REGISTRATION_FLOW_MAX_TIME}s end-to-end
- **Password Reset Email**: Enviado en <{EMAIL_SEND_MAX_TIME}s

### 8.4 Data Requirements

**User Model Fields:**
- Unique identifier (UUID recommended for security)
- Email address (unique, indexed)
- Username (derived from email, unique)
- First name (optional)
- Last name (optional)
- Password (hashed)
- Active status flag
- Staff status flag
- Superuser status flag
- Date joined timestamp
- Last login timestamp

**Password Reset Token Model:**
- Unique identifier
- Reference to user
- Token string (unique, indexed)
- Creation timestamp
- Expiration timestamp (creation + {PASSWORD_RESET_TOKEN_EXPIRY})
- Used timestamp (nullable)

### 8.5 User Experience Requirements

**Form Validation:**
- Validación en tiempo real a medida que usuario escribe
- Mensajes de error claros y traducidos
- Loading states visibles durante operaciones asíncronas
- Success feedback claro después de operaciones exitosas
- Deshabilitar submit button durante procesamiento para prevenir doble envío

**Error Messages:**
- Traducidos a idiomas soportados por la aplicación
- Específicos pero seguros (no revelar información sensible)
- Posicionados cerca del campo con error
- Color coding apropiado (rojo para error, verde para éxito)
- Iconos visuales para mejorar comprensión

**Accessibility:**
- Labels asociados con todos los inputs
- ARIA attributes apropiados
- Navegación por teclado funcional
- Compatible con lectores de pantalla
- Ratios de contraste cumpliendo WCAG 2.1 AA

---

## 9. Implementation Guidance for AI Assistants

### 9.1 Dependencies to Install

La implementación requiere instalar paquetes de autenticación para el framework frontend y backend. Instalar versiones estables compatibles con las versiones actuales de los frameworks.

**Frontend Packages Required:**
- Authentication framework para Next.js (última versión estable compatible)
- Database ORM adapter (si se usa base de datos compartida)
- Password hashing utility (para validaciones frontend si necesario)
- TypeScript type definitions correspondientes

**Backend Packages Required:**
- Modern password hashing library para Python/Django
- JWT library para token management
- Email sending capabilities (si no incluido en framework)
- Rate limiting library

### 9.2 Environment Configuration

Configurar variables de entorno para ambos servicios (frontend y backend).

**Frontend Environment Variables:**
- `{DATABASE_URL}`: Connection string para PostgreSQL
- `{NEXTAUTH_URL}`: URL base de la aplicación
- `{NEXTAUTH_SECRET}`: Secret para firmar tokens (generar con herramienta criptográficamente segura)
- `{API_URL}`: URL del backend API

**Backend Environment Variables:**
- `{SECRET_KEY}`: Secret key del framework
- `{DEBUG}`: Flag de modo debug
- `{DATABASE_URL}`: Connection string para PostgreSQL
- `{ALLOWED_HOSTS}`: Hosts permitidos
- `{CORS_ALLOWED_ORIGINS}`: Orígenes permitidos para CORS
- `{EMAIL_BACKEND}`: Backend de email (console para desarrollo, SMTP para producción)
- Email SMTP configuration (host, port, credentials) para producción

### 9.3 Database Schema Setup

Crear modelos de base de datos para usuarios y tokens de reset.

**User Model:**
- Extender clase abstracta de usuario del framework backend
- Usar UUID como primary key para mejor seguridad
- Email como campo único e indexado
- Username derivado del email (unique)
- Password field para almacenar hash
- Campos de estado (active, staff, superuser)
- Timestamps automáticos

**Password Reset Token Model:**
- UUID como primary key
- Foreign key a User model
- Token string (unique, indexed)
- Creation timestamp (auto)
- Expiration timestamp (auto-calculated: creation + {PASSWORD_RESET_TOKEN_EXPIRY})
- Used timestamp (nullable)
- Method para validar si token es válido (no usado, no expirado)
- Method para marcar token como usado

**Migration Strategy:**
- Generar migración inicial del schema
- Aplicar migración a base de datos de desarrollo
- Verificar que tablas se crearon correctamente
- Crear índices apropiados para performance

### 9.4 Authentication Configuration

Configurar framework de autenticación en frontend con provider de credenciales.

**Provider Configuration:**
- Configurar Credentials Provider para email/password
- Endpoint de autorización apunta a backend API login
- Extraer credenciales del formulario (email, password)
- Enviar credenciales a backend API
- Retornar objeto de usuario si autenticación exitosa
- Retornar null si autenticación falla

**Session Configuration:**
- Strategy: JWT (stateless)
- Max age: {SESSION_MAX_AGE} (ej: 30 días)
- Update age: {SESSION_UPDATE_AGE} (ej: 24 horas)
- Cookie prefix: Usar prefix seguro del framework
- Cookie attributes: httpOnly=true, secure=true (prod), sameSite={SAMESITE_POLICY}

**Callbacks:**
- JWT callback: Agregar user ID y role al token
- Session callback: Agregar datos del token a objeto de sesión
- Authorization callback: Implementar lógica de protección de rutas si necesario

**Pages Configuration:**
- Custom sign-in page: Landing page principal
- Custom error page: Mostrar errores de auth en landing page

### 9.5 Protected Route Middleware

Implementar middleware para proteger rutas que requieren autenticación.

**Middleware Logic:**
1. Extraer sesión/token del request
2. Verificar validez de la sesión
3. Identificar si la ruta actual requiere autenticación
   - Rutas protegidas: Patterns como `/dashboard/*`, `/admin/*`
   - Rutas públicas: Landing, API endpoints públicos, assets estáticos
4. Si ruta protegida Y usuario NO autenticado:
   - Redirigir a landing page
5. Si ruta protegida Y usuario autenticado:
   - Permitir acceso
6. Si ruta pública:
   - Permitir acceso siempre

**Matcher Configuration:**
- Configurar patterns de rutas a las que aplicar middleware
- Excluir rutas que nunca necesitan autenticación (API, static files, etc.)

### 9.6 Frontend Components

**Register Form Component:**
- Email input con validación de formato
- First name y Last name inputs (opcionales)
- Password input con indicador de fortaleza visual
- Password confirmation input
- Submit button con loading state
- Link a "Ya tienes cuenta? Inicia sesión"
- Manejo de errores retornados por backend
- Validación frontend antes de enviar

**Login Form Component:**
- Email input
- Password input
- "Recordarme" checkbox (opcional)
- Submit button con loading state
- Link a "Olvidaste tu contraseña?"
- Link a "Crear cuenta nueva"
- Manejo de errores retornados por backend
- Mostrar mensajes genéricos de error

**Forgot Password Form Component:**
- Email input
- Submit button
- Mensaje de éxito genérico después de envío
- Link para regresar a login
- No revelar si email existe o no

**Reset Password Form Component:**
- Extrae token de URL parameters
- Password input con indicador de fortaleza
- Password confirmation input
- Submit button
- Mensaje de éxito claro
- Redirect automático a login después de éxito
- Manejo de token inválido o expirado

### 9.7 Backend API Implementation

Crear endpoints REST para operaciones de autenticación.

**Registration Endpoint:**
- Method: POST
- Path: `/api/auth/register/`
- Input: Email, password, password confirmation, nombre (opcional), apellido (opcional)
- Validation:
  - Email format válido
  - Email no existe ya en BD
  - Password cumple requisitos de fortaleza
  - Password y confirmación coinciden
- Processing:
  - Hashear password con algoritmo moderno
  - Crear user en BD
  - Generar JWT token
- Response: User object con token (success) o validation errors (error)

**Login Endpoint:**
- Method: POST
- Path: `/api/auth/login/`
- Input: Email, password
- Validation:
  - Email format válido
  - Rate limiting verificado
- Processing:
  - Buscar user por email (timing-safe)
  - Verificar password (timing-safe comparison)
  - Generar JWT token si válido
  - Actualizar last_login timestamp
- Response: User object con token (success) o error genérico (failure)

**Forgot Password Endpoint:**
- Method: POST
- Path: `/api/auth/forgot-password/`
- Input: Email
- Processing:
  - Buscar user por email (silently fail si no existe)
  - Generar token seguro (UUID + secrets)
  - Guardar token en BD con expiration
  - Enviar email con link de reset (si user existe)
  - SIEMPRE retornar mismo mensaje de éxito
- Response: Mensaje genérico de éxito (sin revelar si email existe)

**Reset Password Endpoint:**
- Method: POST
- Path: `/api/auth/reset-password/`
- Input: Token, new password, password confirmation
- Validation:
  - Token existe y no ha expirado
  - Token no ha sido usado
  - Password cumple requisitos
  - Password y confirmación coinciden
- Processing:
  - Validar token
  - Hashear nueva password
  - Actualizar password del user
  - Marcar token como usado
- Response: Mensaje de éxito (success) o errores de validación (error)

### 9.8 Email Service Implementation

Configurar servicio de envío de emails para password reset.

**Email Templates:**
- Template HTML responsive para password reset
- Incluir link con token embebido
- Branding consistente con la aplicación
- Texto claro explicando el proceso
- Tiempo de expiración del link visible

**Email Configuration:**
- Development: Console backend (emails aparecen en logs)
- Production: SMTP backend con proveedor de email transaccional
- Configurar retry logic para fallos
- Logging de emails enviados para auditoría

**Security Considerations:**
- Token nunca en URL query parameters (usar path parameter)
- Link con HTTPS only
- Email debe indicar que si no solicitó reset, ignore el email
- Rate limiting en envío de emails de reset

---

## 10. Reference Implementation Patterns

### Pattern 1: Password Hashing
```
Configurar password hasher con:
- Algorithm: {PASSWORD_HASH_ALGORITHM}
- Memory cost: {HASH_MEMORY_COST} KB
- Time cost: {HASH_TIME_COST} iterations
- Parallelism: {HASH_PARALLELISM} threads
- Salt length: {HASH_SALT_LENGTH} bytes (auto-generated)

Proceso de hashing:
1. Recibir password en texto plano del request
2. Generar salt aleatorio único
3. Aplicar algoritmo de hashing con parámetros configurados
4. Retornar hash completo (incluyendo salt y parámetros)
5. Almacenar solo el hash, nunca la password original

Proceso de verificación:
1. Recibir password en texto plano y hash almacenado
2. Extraer parámetros y salt del hash
3. Re-hashear password con mismos parámetros
4. Comparación timing-safe del hash nuevo vs almacenado
5. Retornar true si coinciden, false si no
```

### Pattern 2: JWT Session Management
```
Configurar JWT con:
- Signing algorithm: {JWT_ALGORITHM}
- Secret key: {JWT_SECRET} (minimum {JWT_SECRET_MIN_LENGTH} bits)
- Access token lifetime: {ACCESS_TOKEN_LIFETIME}
- Refresh token lifetime: {REFRESH_TOKEN_LIFETIME}

Token payload debe incluir:
- User ID (UUID)
- Email
- Issued at timestamp
- Expiration timestamp
- Token type (access vs refresh)

Cookie configuration:
- Name: Framework-specific secure prefix
- HttpOnly: true
- Secure: true (production only)
- SameSite: {SAMESITE_POLICY}
- Path: /
- Max-Age: {SESSION_MAX_AGE}

Token validation:
1. Extract token from HttpOnly cookie
2. Verify signature using secret key
3. Check expiration timestamp
4. Verify token hasn't been revoked (si hay revocation list)
5. Extract user data from payload
6. Return user object or null
```

### Pattern 3: Rate Limiting Strategy
```
Login rate limiting:
- Identificador: IP address del cliente
- Límite: {MAX_LOGIN_ATTEMPTS} intentos
- Ventana de tiempo: {LOGIN_RATE_WINDOW}
- Acción al exceder: Bloquear por {LOGIN_BLOCK_DURATION}
- Mensaje: Generic message sin detalles técnicos

Registration rate limiting:
- Identificador: IP address del cliente
- Límite: {MAX_REGISTRATION_ATTEMPTS} registros
- Ventana de tiempo: {REGISTRATION_RATE_WINDOW}
- Acción al exceder: Bloquear temporalmente
- Mensaje: Indicar que intente más tarde

Password reset rate limiting:
- Identificador: Email address
- Límite: {MAX_RESET_ATTEMPTS} intentos
- Ventana de tiempo: {RESET_RATE_WINDOW}
- Acción al exceder: No enviar más emails
- Mensaje: Genérico sin revelar que se bloqueó

Implementación:
- Almacenar contador en cache/memoria (Redis recomendado)
- Incrementar contador en cada intento
- Expirar contador después de ventana de tiempo
- Verificar límite antes de procesar request
- Retornar 429 Too Many Requests si excede
```

### Pattern 4: Anti-Enumeration Strategy
```
Login flow timing-safe:
1. Usuario envía email y password
2. Buscar user en BD por email
3. SI user existe:
   - Verificar password usando algoritmo de hashing
   - Retornar resultado
4. SI user NO existe:
   - Ejecutar operación dummy de hashing (mismo tiempo)
   - Retornar mismo error genérico

Importante:
- Tiempo de respuesta debe ser consistente
- Error message idéntico si email no existe vs password incorrecta
- No revelar información sobre existencia de cuentas
- Logging interno puede ser específico (para debugging)

Password reset anti-enumeration:
1. Usuario envía email
2. Buscar user en BD
3. SI existe: Generar token, enviar email
4. SI NO existe: No hacer nada
5. SIEMPRE retornar: "Si el email existe, recibirás instrucciones"

Beneficios:
- Previene enumeration de usuarios registrados
- Protege privacy de usuarios
- Dificulta ataques dirigidos
```

### Pattern 5: Password Reset Token Generation
```
Token generation:
1. Generar UUID4 como base
2. Agregar entropy adicional usando secrets module
3. Hash final del token para almacenamiento
4. Almacenar hash en BD junto con:
   - User ID
   - Expiration timestamp (now + {PASSWORD_RESET_TOKEN_EXPIRY})
   - Creation timestamp
5. Enviar token original (sin hashear) por email

Token validation:
1. Recibir token del request
2. Hash el token recibido
3. Buscar hash en BD
4. Verificar que:
   - Token existe
   - No ha expirado (now < expiration)
   - No ha sido usado (used_at is null)
5. Si válido: permitir reset
6. Si inválido: mostrar error genérico

Token usage:
1. User establece nueva password
2. Validar nueva password cumple requisitos
3. Hashear nueva password
4. Actualizar user password
5. Marcar token como usado (set used_at = now)
6. Opcional: Invalidar todas las sesiones activas
```

---

## 11. Testing & Validation

### 11.1 Functional Testing Checklist

**Registration Flow:**
- [ ] Usuario puede registrarse con datos válidos
- [ ] Email duplicado es rechazado con mensaje apropiado
- [ ] Contraseña débil es rechazada según {PASSWORD_REQUIREMENTS}
- [ ] Contraseñas no coincidentes son rechazadas
- [ ] Email con formato inválido es rechazado
- [ ] Usuario queda autenticado automáticamente después de registro
- [ ] Usuario es redirigido a dashboard después de registro
- [ ] Password está hasheada en base de datos (verificar que no es texto plano)

**Login Flow:**
- [ ] Login exitoso con credenciales válidas
- [ ] Login fallido con password incorrecta muestra error genérico
- [ ] Login fallido con email no existente muestra mismo error genérico
- [ ] Rate limiting bloquea después de {MAX_LOGIN_ATTEMPTS} intentos
- [ ] Sesión creada correctamente con token JWT
- [ ] Cookie HttpOnly seteada con flags de seguridad correctos
- [ ] Last login timestamp actualizado

**Password Reset Flow:**
- [ ] Email enviado si usuario existe
- [ ] Mismo mensaje mostrado si usuario no existe
- [ ] Token generado es criptográficamente seguro
- [ ] Email contiene link con token embebido
- [ ] Link expira después de {PASSWORD_RESET_TOKEN_EXPIRY}
- [ ] Nueva contraseña puede ser establecida con token válido
- [ ] Token es invalidado después de uso exitoso
- [ ] Mismo token no puede ser usado dos veces
- [ ] Token expirado muestra error apropiado

### 11.2 Security Testing Checklist

**Password Security:**
- [ ] Contraseñas hasheadas con algoritmo moderno configurado
- [ ] Salt automático y único por cada usuario
- [ ] Contraseñas no pueden ser recuperadas (solo reset)
- [ ] Contraseñas no aparecen en logs del sistema
- [ ] Contraseñas no aparecen en respuestas de API

**Session Security:**
- [ ] JWT firmado con algoritmo seguro
- [ ] Secret key tiene entropía suficiente ({JWT_SECRET_MIN_LENGTH} bits)
- [ ] Cookies tienen flag HttpOnly (JavaScript no puede acceder)
- [ ] Cookies tienen flag Secure en producción (HTTPS only)
- [ ] Cookies tienen SameSite configurado correctamente
- [ ] Token no puede ser modificado sin detectar alteración

**API Security:**
- [ ] Rate limiting funciona en todos los endpoints de auth
- [ ] CORS configurado estrictamente (solo orígenes permitidos)
- [ ] SQL injection protegido (ORM previene)
- [ ] XSS protegido (framework hace auto-escaping)
- [ ] CSRF protection activo
- [ ] HTTPS enforced en producción

**Anti-Enumeration:**
- [ ] Login no revela si email existe o no
- [ ] Password reset no revela si email existe o no
- [ ] Tiempos de respuesta consistentes (timing-safe)
- [ ] Error messages genéricos en autenticación

### 11.3 Performance Testing

- [ ] Password hashing completa en <{HASH_MAX_TIME}ms
- [ ] Session validation completa en <{SESSION_VALIDATION_TIME}ms
- [ ] Login flow end-to-end en <{LOGIN_FLOW_MAX_TIME}s
- [ ] Registration flow end-to-end en <{REGISTRATION_FLOW_MAX_TIME}s
- [ ] Password reset email enviado en <{EMAIL_SEND_MAX_TIME}s
- [ ] Database queries optimizadas (índices en email, token)
- [ ] No N+1 query problems
- [ ] Aplicación maneja {CONCURRENT_USERS_TARGET} usuarios concurrentes

### 11.4 User Experience Testing

- [ ] Validación en tiempo real funciona mientras usuario escribe
- [ ] Mensajes de error claros y traducidos a idiomas soportados
- [ ] Loading states visibles durante operaciones asíncronas
- [ ] Forms accesibles con navegación por teclado
- [ ] Compatible con lectores de pantalla
- [ ] Responsive en todos los tamaños de pantalla
- [ ] Password strength indicator proporciona feedback visual
- [ ] Botones deshabilitados durante procesamiento
- [ ] Success feedback claro después de operaciones exitosas

---

## 12. Success Criteria

### Functional Criteria
- ✅ Usuarios pueden registrarse con email y contraseña
- ✅ Usuarios pueden iniciar sesión con credenciales
- ✅ Contraseñas hasheadas de forma segura (nunca en texto plano)
- ✅ Validación de fortaleza de contraseña según {PASSWORD_REQUIREMENTS}
- ✅ Prevención de emails duplicados funciona correctamente
- ✅ Flujo de recuperación de contraseña completo y funcional
- ✅ Rate limiting protege contra brute force attacks
- ✅ Mensajes de error seguros (anti-enumeration funciona)
- ✅ Sesión automática después de registro exitoso
- ✅ Todos los criterios de aceptación (AC-1 a AC-6) cumplidos
- ✅ Todos los escenarios de prueba pasan correctamente

### Non-Functional Criteria
- ✅ Performance cumple targets configurados
- ✅ Security: OWASP compliance, sin vulnerabilidades conocidas
- ✅ UX: Forms responsive, accessible (WCAG 2.1 AA)
- ✅ Scalability: Sesiones stateless soportan horizontal scaling
- ✅ Reliability: {PASSWORD_RESET_SUCCESS_RATE}% éxito en password reset

### Documentation Criteria
- ✅ Variables de entorno documentadas en .env.example
- ✅ Endpoints de API documentados
- ✅ Decisiones de seguridad explicadas en código
- ✅ Testing checklist completo y ejecutado

---

## 13. Risk Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|-------------------|
| Email delivery failures | Medium | Medium | Usar proveedor confiable de email transaccional. Implementar retry logic. Logging de fallos para debugging. Mostrar mensaje de éxito incluso si email falla (user puede intentar reset de nuevo). |
| Brute force attacks | High | Medium | Implementar rate limiting estricto según configuración. Considerar CAPTCHA después de X intentos fallidos. Monitoring de patrones de ataque. Bloqueos temporales por IP. |
| Password reset token theft | High | Low | Tokens expiran en {PASSWORD_RESET_TOKEN_EXPIRY}. Un solo uso por token. HTTPS only en producción. Token en path, no en query params. Hash tokens en BD. |
| Timing attacks | Medium | Low | Usar comparaciones timing-safe en password verification. Ejecutar operación dummy de hashing cuando user no existe. Tiempo de respuesta consistente. |
| User enumeration | Medium | Medium | Mensajes de error genéricos siempre. Misma respuesta para emails existentes/no existentes. No revelar información en ningún endpoint. |
| Session hijacking | High | Low | HttpOnly cookies previenen acceso de JavaScript. Secure flag en producción. SameSite protection. HTTPS obligatorio. Tokens de corta duración. |
| Weak passwords | Medium | High | Validación estricta según {PASSWORD_REQUIREMENTS}. Password strength meter visual. Educación de usuario en UI. Rechazo de contraseñas comunes. |
| Hash algorithm obsolescence | Low | Low | Configuración permite cambio de algoritmo. Design permite re-hashing gradual. Monitoring de recomendaciones OWASP. |

---

## 14. Out of Scope (Future Enhancements)

Las siguientes funcionalidades están explícitamente excluidas de esta implementación y pueden considerarse para iteraciones futuras:

- **Email Verification (OTP)**: Verificación de email mediante código de un solo uso enviado por email
- **Change Email Flow**: Permitir a usuarios cambiar su email con proceso de verificación
- **Two-Factor Authentication (2FA)**: Capa adicional de seguridad con TOTP, SMS, o autenticación biométrica
- **Password History**: Prevenir reuso de X contraseñas anteriores
- **Login with Username**: Alternativa a email como identificador
- **Account Deletion**: Flujo completo de eliminación de cuenta con confirmación
- **Login Activity Log**: Historial detallado de logins con IP, dispositivo, ubicación
- **Suspicious Activity Detection**: Alertas automáticas de logins desde ubicaciones inusuales
- **Passkeys / WebAuthn**: Autenticación moderna sin contraseña usando biometría o security keys
- **Magic Links**: Login sin contraseña mediante link único enviado por email
- **Social Account Linking**: Vincular cuenta email/password con cuentas sociales
- **Password Strength Requirement Tiers**: Diferentes requisitos basados en tipo de cuenta
- **Biometric Authentication**: Face ID, Touch ID, fingerprint en dispositivos móviles

---

## Appendix A: Placeholder Reference

Este documento usa placeholders para mantener flexibilidad. Valores recomendados:

| Placeholder | Recommended Value | Description |
|------------|------------------|-------------|
| `{REGISTRATION_TIME_TARGET}` | `45` | Segundos objetivo para completar registro |
| `{CONVERSION_RATE_TARGET}` | `75` | Porcentaje mínimo de conversión en registro |
| `{PASSWORD_RESET_SUCCESS_RATE}` | `90` | Porcentaje de éxito en recuperación de contraseña |
| `{SESSION_VALIDATION_TIME}` | `10` | Milisegundos máximos para validar sesión |
| `{PASSWORD_MIN_LENGTH}` | `8` | Caracteres mínimos de contraseña |
| `{PASSWORD_MIN_UPPERCASE}` | `1` | Letras mayúsculas mínimas |
| `{PASSWORD_MIN_LOWERCASE}` | `1` | Letras minúsculas mínimas |
| `{PASSWORD_MIN_DIGITS}` | `1` | Dígitos mínimos |
| `{PASSWORD_RESET_TOKEN_EXPIRY}` | `1 hour` | Tiempo de expiración de token de reset |
| `{MAX_LOGIN_ATTEMPTS}` | `5` | Intentos de login antes de bloqueo |
| `{LOGIN_RATE_WINDOW}` | `5 minutes` | Ventana de tiempo para rate limiting de login |
| `{LOGIN_BLOCK_DURATION}` | `5 minutes` | Duración de bloqueo por exceso de intentos |
| `{MAX_REGISTRATION_ATTEMPTS}` | `3` | Registros máximos por ventana de tiempo |
| `{REGISTRATION_RATE_WINDOW}` | `1 hour` | Ventana para rate limiting de registro |
| `{MAX_RESET_ATTEMPTS}` | `3` | Intentos de reset máximos por ventana |
| `{RESET_RATE_WINDOW}` | `1 hour` | Ventana para rate limiting de reset |
| `{PASSWORD_HASH_ALGORITHM}` | `Argon2id` | Algoritmo de hashing recomendado |
| `{HASH_MEMORY_COST}` | `65536` | KB de memoria para Argon2 |
| `{HASH_TIME_COST}` | `3` | Iteraciones de Argon2 |
| `{HASH_PARALLELISM}` | `4` | Threads paralelos para Argon2 |
| `{HASH_SALT_LENGTH}` | `16` | Bytes de salt |
| `{HASH_MAX_TIME}` | `500` | Milisegundos máximos para hashing |
| `{SESSION_MAX_AGE}` | `30 days` | Duración máxima de sesión |
| `{SESSION_UPDATE_AGE}` | `24 hours` | Frecuencia de actualización de sesión |
| `{ACCESS_TOKEN_LIFETIME}` | `15 minutes` | Vida de access token |
| `{REFRESH_TOKEN_LIFETIME}` | `7 days` | Vida de refresh token |
| `{JWT_ALGORITHM}` | `HS256` | Algoritmo para firmar JWT |
| `{JWT_SECRET_MIN_LENGTH}` | `256` | Bits mínimos de secret key |
| `{SAMESITE_POLICY}` | `Lax` or `Strict` | Política SameSite para cookies |
| `{LOGIN_FLOW_MAX_TIME}` | `2` | Segundos máximos para flujo de login |
| `{REGISTRATION_FLOW_MAX_TIME}` | `3` | Segundos máximos para flujo de registro |
| `{EMAIL_SEND_MAX_TIME}` | `5` | Segundos máximos para enviar email |
| `{CONCURRENT_USERS_TARGET}` | `100` | Usuarios concurrentes objetivo para testing |
| `{NEXTJS_VERSION}` | `16.1.0` | Versión actual de Next.js |
| `{REACT_VERSION}` | `19.2.3` | Versión actual de React |
| `{DJANGO_VERSION}` | `5.2.9` | Versión actual de Django |
| `{PG_VERSION}` | `16` | Versión de PostgreSQL |

---

**Status:** ✅ READY FOR IMPLEMENTATION
**Document Type:** Product Requirements Document (PRD)
**Last Updated:** 2025-12-25
**Approach:** Natural Language with Placeholders - AI Assistant Guidance Format
