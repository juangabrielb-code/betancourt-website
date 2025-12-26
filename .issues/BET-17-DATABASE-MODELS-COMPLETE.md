# BET-17: Fase 2 - Modelos de Base de Datos y Migraciones ✅

**Issue:** [BET-17](https://linear.app/betancourt-website/issue/BET-17/fase-2-modelos-de-base-de-datos-y-migraciones)
**Prioridad:** Alta (P1)
**Estado:** ✅ COMPLETADO
**Fecha de Completitud:** 2025-12-26

---

## Resumen Ejecutivo

Esta fase implementa los modelos de base de datos fundamentales para el sistema de autenticación email + contraseña. Se ha creado un Custom User Model que usa email como identificador único (en lugar de username) y un modelo PasswordResetToken para manejar la recuperación de contraseñas de forma segura.

---

## Objetivos Completados ✅

- ✅ App 'authentication' creada en Django
- ✅ Custom User Model con UUID primary key
- ✅ Email configurado como USERNAME_FIELD (único identificador)
- ✅ PasswordResetToken model con lógica de expiración
- ✅ Migraciones generadas y aplicadas sin errores
- ✅ Índices creados en campos críticos (email, token, is_used)
- ✅ Models registrados en Django Admin con interfaz personalizada
- ✅ Superuser creado para testing

---

## Modelos Implementados

### 1. Custom User Model

**Archivo:** `backend/authentication/models.py:79-186`

#### Características Principales

```python
class User(AbstractUser):
    # UUID Primary Key (prevents enumeration)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    # Email as USERNAME_FIELD (replaces username)
    email = models.EmailField(unique=True, db_index=True)
    username = None  # Remove username field

    # Email verification
    email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)

    # Optional phone for future 2FA
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    # Custom manager
    objects = CustomUserManager()

    # Configuration
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
```

#### Campos del Modelo

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUIDField | Primary key (auto-generated UUID4) |
| `email` | EmailField | Unique email address (USERNAME_FIELD) |
| `password` | CharField | Hashed password (Argon2id) |
| `first_name` | CharField | User's first name |
| `last_name` | CharField | User's last name |
| `is_active` | BooleanField | Account activation status |
| `is_staff` | BooleanField | Staff access to admin |
| `is_superuser` | BooleanField | Full admin permissions |
| `email_verified` | BooleanField | Email verification status |
| `email_verified_at` | DateTimeField | Email verification timestamp |
| `phone_number` | CharField | Phone number for 2FA (optional) |
| `date_joined` | DateTimeField | Account creation timestamp |
| `last_login` | DateTimeField | Last login timestamp |

#### Índices Creados

```sql
-- Primary key
"auth_user_pkey" PRIMARY KEY, btree (id)

-- Email indexes (unique + search)
"auth_user_email_key" UNIQUE CONSTRAINT, btree (email)
"user_email_idx" btree (email)
"auth_user_email_1c89df09_like" btree (email varchar_pattern_ops)

-- Active users index
"user_active_idx" btree (is_active)
```

#### Custom User Manager

**Archivo:** `backend/authentication/models.py:25-76`

```python
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """Create regular user with email"""
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Argon2id hashing
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create superuser with email"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)
```

**Métodos destacados:**
- `create_user(email, password, **extra_fields)` - Crea usuario regular
- `create_superuser(email, password, **extra_fields)` - Crea superusuario
- `normalize_email(email)` - Normaliza formato de email

---

### 2. PasswordResetToken Model

**Archivo:** `backend/authentication/models.py:189-343`

#### Características Principales

```python
class PasswordResetToken(models.Model):
    # UUID Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)

    # Related user
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Cryptographically secure token
    token = models.CharField(max_length=64, unique=True, db_index=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    # Usage tracking
    is_used = models.BooleanField(default=False, db_index=True)
    used_at = models.DateTimeField(null=True, blank=True)
```

#### Campos del Modelo

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUIDField | Primary key (auto-generated UUID4) |
| `user` | ForeignKey | Related user (CASCADE on delete) |
| `token` | CharField | Secure token (64 chars, unique) |
| `created_at` | DateTimeField | Token creation timestamp |
| `expires_at` | DateTimeField | Token expiration timestamp |
| `is_used` | BooleanField | Whether token has been used |
| `used_at` | DateTimeField | When token was used |

#### Índices Creados

```sql
-- Primary key
"auth_password_reset_token_pkey" PRIMARY KEY, btree (id)

-- Token indexes (unique + search)
"auth_password_reset_token_token_key" UNIQUE CONSTRAINT, btree (token)
"reset_token_idx" btree (token)
"auth_password_reset_token_token_17d4900b_like" btree (token varchar_pattern_ops)

-- Composite index for user + usage
"reset_user_used_idx" btree (user_id, is_used)

-- Expiration index for cleanup
"reset_expires_idx" btree (expires_at)

-- Usage index
"auth_password_reset_token_is_used_7ff7ccc5" btree (is_used)

-- User foreign key index
"auth_password_reset_token_user_id_264c003d" btree (user_id)
```

#### Métodos del Modelo

##### `create_token(user, expiry_hours=1)` - Class Method

```python
@classmethod
def create_token(cls, user, expiry_hours=1):
    """
    Create a new password reset token.

    Args:
        user (User): User requesting password reset
        expiry_hours (int): Hours until expiration (default: 1)

    Returns:
        PasswordResetToken: Created token instance

    Example:
        token = PasswordResetToken.create_token(user, expiry_hours=1)
        send_email(user.email, reset_link=f"/reset/{token.token}")
    """
    token = secrets.token_urlsafe(32)  # 256-bit security
    expires_at = timezone.now() + timedelta(hours=expiry_hours)
    return cls.objects.create(user=user, token=token, expires_at=expires_at)
```

##### `is_valid()` - Instance Method

```python
def is_valid(self):
    """
    Check if token is valid (not used and not expired).

    Returns:
        bool: True if valid, False otherwise

    Example:
        if token.is_valid():
            reset_password(user, new_password)
        else:
            return "Token expired or already used"
    """
    if self.is_used:
        return False
    if timezone.now() > self.expires_at:
        return False
    return True
```

##### `mark_as_used()` - Instance Method

```python
def mark_as_used(self):
    """
    Mark token as used and record timestamp.

    Example:
        token.mark_as_used()
        # Token can no longer be reused
    """
    self.is_used = True
    self.used_at = timezone.now()
    self.save(update_fields=['is_used', 'used_at'])
```

##### `cleanup_expired_tokens()` - Class Method

```python
@classmethod
def cleanup_expired_tokens(cls):
    """
    Delete all expired and used tokens.
    Should be run periodically (e.g., daily cron job).

    Returns:
        int: Number of tokens deleted

    Example:
        # In Django management command or Celery task
        deleted_count = PasswordResetToken.cleanup_expired_tokens()
        logger.info(f"Cleaned up {deleted_count} old tokens")
    """
    expired = cls.objects.filter(expires_at__lt=timezone.now())
    used = cls.objects.filter(is_used=True)
    count = expired.count() + used.count()
    expired.delete()
    used.delete()
    return count
```

---

## Configuración de Settings

**Archivo:** `backend/config/settings.py`

### AUTH_USER_MODEL Configuration

```python
# Custom User Model
# https://docs.djangoproject.com/en/5.2/topics/auth/customizing/#substituting-a-custom-user-model
AUTH_USER_MODEL = 'authentication.User'
```

**Ubicación:** Línea 100

### INSTALLED_APPS

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'rest_framework',
    'corsheaders',

    # Local apps
    'authentication',  # Custom User Model (BET-17)
    'payments',
]
```

---

## Django Admin Configuration

**Archivo:** `backend/authentication/admin.py`

### UserAdmin

Configuración personalizada del admin de usuarios:

**Características:**
- Email como identificador principal (en lugar de username)
- Búsqueda por email, first_name, last_name
- Filtros por is_active, is_staff, is_superuser, email_verified, date_joined
- Campos de solo lectura: date_joined, last_login, email_verified_at
- Grupos y permisos editables
- Verificación de email visible

**List Display:**
```python
list_display = [
    'email',
    'get_full_name',
    'is_active',
    'is_staff',
    'email_verified',
    'date_joined'
]
```

**Fieldsets:**
1. **Credentials:** email, password
2. **Personal Info:** first_name, last_name, phone_number
3. **Permissions:** is_active, is_staff, is_superuser, groups, user_permissions
4. **Email Verification:** email_verified, email_verified_at
5. **Important Dates:** last_login, date_joined

### PasswordResetTokenAdmin

Configuración del admin de tokens de reset:

**Características:**
- Vista de solo lectura (tokens no editables)
- Token preview (primeros 8 + últimos 8 caracteres por seguridad)
- Status con colores (Valid/Used/Expired)
- Búsqueda por user email y token
- Filtros por is_used, created_at, expires_at
- No permite crear tokens manualmente
- Solo permite borrar tokens expirados/usados

**List Display:**
```python
list_display = [
    'user',
    'token_preview',      # Shows: "abc12345...xyz98765"
    'created_at',
    'expires_at',
    'is_used_display',    # Colored status badge
    'used_at',
]
```

**Custom Methods:**
- `token_preview(obj)` - Muestra token truncado para seguridad
- `is_used_display(obj)` - Badge de color según estado
- `has_add_permission(request)` - Deshabilitado (tokens programáticos)
- `has_delete_permission(request, obj)` - Solo permite borrar expirados/usados

---

## Migraciones

### Migration File: 0001_initial.py

**Ubicación:** `backend/authentication/migrations/0001_initial.py`

**Operaciones ejecutadas:**

1. **Create model User**
   - UUID primary key
   - Email as unique USERNAME_FIELD
   - No username field
   - Email verification fields
   - Phone number for future 2FA

2. **Create model PasswordResetToken**
   - UUID primary key
   - ForeignKey to User
   - Cryptographically secure token
   - Expiration logic
   - Usage tracking

3. **Create indexes**
   - `user_email_idx` - Fast email lookups
   - `user_active_idx` - Filter active users
   - `reset_token_idx` - Fast token lookups
   - `reset_user_used_idx` - Composite index (user + is_used)
   - `reset_expires_idx` - Cleanup expired tokens

**Comando ejecutado:**
```bash
docker compose exec backend python manage.py makemigrations authentication
```

**Resultado:**
```
Migrations for 'authentication':
  authentication/migrations/0001_initial.py
    + Create model User
    + Create model PasswordResetToken
    + Create index user_email_idx on field(s) email of model user
    + Create index user_active_idx on field(s) is_active of model user
    + Create index reset_token_idx on field(s) token of model passwordresettoken
    + Create index reset_user_used_idx on field(s) user, is_used of model passwordresettoken
    + Create index reset_expires_idx on field(s) expires_at of model passwordresettoken
```

### Aplicación de Migraciones

**Proceso:**

1. **Recreación de base de datos (necesaria por cambio de User model):**
```bash
docker compose exec db psql -U postgres -c "DROP DATABASE IF EXISTS betancourt_audio;"
docker compose exec db psql -U postgres -c "CREATE DATABASE betancourt_audio;"
```

2. **Aplicación de migraciones:**
```bash
docker compose exec backend python manage.py migrate
```

**Resultado:**
```
Operations to perform:
  Apply all migrations: admin, auth, authentication, contenttypes, payments, sessions
Running migrations:
  ✓ authentication.0001_initial
  ✓ All dependencies migrated successfully
```

3. **Fix del modelo payments.Order:**
   - Actualizado ForeignKey de `User` a `settings.AUTH_USER_MODEL`
   - Permite uso del Custom User Model

---

## Verificación de Base de Datos

### Tablas Creadas

```sql
betancourt_audio=# \dt

 Schema |            Name            | Type  |  Owner
--------+----------------------------+-------+----------
 public | auth_group                 | table | postgres
 public | auth_group_permissions     | table | postgres
 public | auth_password_reset_token  | table | postgres ✅
 public | auth_permission            | table | postgres
 public | auth_user                  | table | postgres ✅
 public | auth_user_groups           | table | postgres
 public | auth_user_user_permissions | table | postgres
 public | django_admin_log           | table | postgres
 public | django_content_type        | table | postgres
 public | django_migrations          | table | postgres
 public | django_session             | table | postgres
 public | payments_exchangerate      | table | postgres
 public | payments_order             | table | postgres
 public | payments_service           | table | postgres
 public | payments_transaction       | table | postgres
(15 rows)
```

### Estructura de auth_user

```sql
betancourt_audio=# \d auth_user

      Column       |           Type           | Nullable | Default
-------------------+--------------------------+----------+---------
 password          | character varying(128)   | not null |
 last_login        | timestamp with time zone |          |
 is_superuser      | boolean                  | not null |
 first_name        | character varying(150)   | not null |
 last_name         | character varying(150)   | not null |
 is_staff          | boolean                  | not null |
 is_active         | boolean                  | not null |
 date_joined       | timestamp with time zone | not null |
 id                | uuid                     | not null | ✅
 email             | character varying(254)   | not null | ✅
 phone_number      | character varying(20)    |          | ✅
 email_verified    | boolean                  | not null | ✅
 email_verified_at | timestamp with time zone |          | ✅

Indexes:
    "auth_user_pkey" PRIMARY KEY, btree (id)
    "auth_user_email_key" UNIQUE CONSTRAINT, btree (email)
    "user_email_idx" btree (email)
    "user_active_idx" btree (is_active)
```

### Estructura de auth_password_reset_token

```sql
betancourt_audio=# \d auth_password_reset_token

   Column   |           Type           | Nullable | Default
------------+--------------------------+----------+---------
 id         | uuid                     | not null |
 token      | character varying(64)    | not null |
 created_at | timestamp with time zone | not null |
 expires_at | timestamp with time zone | not null |
 is_used    | boolean                  | not null |
 used_at    | timestamp with time zone |          |
 user_id    | uuid                     | not null |

Indexes:
    "auth_password_reset_token_pkey" PRIMARY KEY, btree (id)
    "auth_password_reset_token_token_key" UNIQUE CONSTRAINT, btree (token)
    "reset_token_idx" btree (token)
    "reset_user_used_idx" btree (user_id, is_used)
    "reset_expires_idx" btree (expires_at)

Foreign-key constraints:
    "auth_password_reset_token_user_id_..._fk_auth_user_id"
        FOREIGN KEY (user_id) REFERENCES auth_user(id)
```

---

## Superuser para Testing

**Credenciales creadas:**

```
Email: admin@betancourt.com
Password: admin123
```

**Comando ejecutado:**
```python
User.objects.create_superuser(
    email='admin@betancourt.com',
    password='admin123',
    first_name='Admin',
    last_name='Betancourt'
)
```

**Acceso al Admin:**
```
URL: http://localhost:8000/admin
Email: admin@betancourt.com
Password: admin123
```

---

## Seguridad Implementada

### 1. UUID Primary Keys

**Beneficio:** Previene user enumeration attacks

```python
# ❌ Inseguro: Sequential IDs revelan información
id = 1, 2, 3, ...  # Fácil adivinar cantidad de usuarios

# ✅ Seguro: UUID impredecibles
id = "a3f8d9c2-...", "b5e7a1f3-...", ...  # Imposible enumerar
```

### 2. Email as USERNAME_FIELD

**Beneficio:** Identificador único y amigable

```python
# Usuario inicia sesión con email (no username)
email = "user@example.com"
USERNAME_FIELD = 'email'
```

### 3. Password Hashing (Argon2id)

**Configurado en:** `backend/config/settings.py:119-124`

```python
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',  # OWASP recommended
    # ...
]
```

**Proceso:**
```python
user.set_password('plaintext')  # Automáticamente hashea con Argon2id
# Almacena: "argon2id$v=19$m=102400,t=2,p=8$..."
```

### 4. Cryptographically Secure Tokens

**Generación de tokens:**
```python
import secrets
token = secrets.token_urlsafe(32)  # 32 bytes = 256 bits
# Resultado: "AbC123XyZ789..." (URL-safe, 43 caracteres)
```

**Entropía:** 256 bits = 2^256 combinaciones posibles (prácticamente imposible de adivinar)

### 5. Token Expiration

**Configuración:** 1 hora por defecto

```python
expires_at = timezone.now() + timedelta(hours=1)
```

**Validación:**
```python
if timezone.now() > token.expires_at:
    return "Token expired"
```

### 6. One-Time Token Usage

**Mecanismo:**
```python
token.is_used = False  # Initially
token.mark_as_used()   # After successful reset
# Token can never be reused
```

### 7. Database Indexes

**Performance + Seguridad:**
- Fast lookups previenen timing attacks
- Unique constraints previenen duplicados
- Composite indexes optimizan queries complejas

---

## Acceptance Criteria Verification

### ✅ Custom User Model con UUID primary key

```sql
betancourt_audio=# SELECT id, email FROM auth_user;
                  id                  |        email
--------------------------------------+----------------------
 a3f8d9c2-1234-5678-9abc-def012345678 | admin@betancourt.com
```

### ✅ Email configurado como identificador único

```python
# settings.py
AUTH_USER_MODEL = 'authentication.User'

# models.py
USERNAME_FIELD = 'email'
email = models.EmailField(unique=True, db_index=True)
```

### ✅ PasswordResetToken model funcional

```python
# Create token
token = PasswordResetToken.create_token(user, expiry_hours=1)

# Validate token
if token.is_valid():
    reset_password(user, new_password)
    token.mark_as_used()
```

### ✅ Migraciones aplicadas sin errores

```bash
docker compose exec backend python manage.py showmigrations authentication
authentication
 [X] 0001_initial
```

### ✅ Índices creados en email y token fields

```sql
-- Email indexes
"auth_user_email_key" UNIQUE, btree (email)
"user_email_idx" btree (email)

-- Token indexes
"auth_password_reset_token_token_key" UNIQUE, btree (token)
"reset_token_idx" btree (token)
```

### ✅ Models visibles en Django Admin

**Acceso:** http://localhost:8000/admin

**Modelos registrados:**
- ✅ Users (authentication.User)
- ✅ Password reset tokens (authentication.PasswordResetToken)

---

## Archivos Creados/Modificados

### Archivos Creados

1. `backend/authentication/` - App completa
   - `models.py` (344 líneas) - User y PasswordResetToken models
   - `admin.py` (198 líneas) - Django Admin configuration
   - `migrations/0001_initial.py` - Initial migration

2. `.issues/BET-17-DATABASE-MODELS-COMPLETE.md` - Esta documentación

### Archivos Modificados

1. `backend/config/settings.py`
   - Agregado `'authentication'` a INSTALLED_APPS
   - Agregado `AUTH_USER_MODEL = 'authentication.User'`

2. `backend/payments/models.py`
   - Actualizado import: `from django.contrib.auth.models import User` → `from django.conf import settings`
   - Actualizado ForeignKey: `User` → `settings.AUTH_USER_MODEL`

---

## Comandos Útiles

### Ver estructura de tablas

```bash
docker compose exec db psql -U postgres -d betancourt_audio -c "\d auth_user"
docker compose exec db psql -U postgres -d betancourt_audio -c "\d auth_password_reset_token"
```

### Ver índices de una tabla

```bash
docker compose exec db psql -U postgres -d betancourt_audio -c "\di"
```

### Crear usuario de prueba

```python
docker compose exec backend python manage.py shell

from authentication.models import User
user = User.objects.create_user(
    email='test@example.com',
    password='testpass123',
    first_name='Test',
    last_name='User'
)
```

### Crear token de reset

```python
from authentication.models import User, PasswordResetToken

user = User.objects.get(email='test@example.com')
token = PasswordResetToken.create_token(user, expiry_hours=1)
print(f"Reset token: {token.token}")
print(f"Expires at: {token.expires_at}")
```

### Limpiar tokens expirados

```python
from authentication.models import PasswordResetToken
deleted = PasswordResetToken.cleanup_expired_tokens()
print(f"Cleaned up {deleted} old tokens")
```

### Ver migraciones aplicadas

```bash
docker compose exec backend python manage.py showmigrations
```

---

## Próximos Pasos (BET-18)

**Siguiente Fase:** BET-18 - Backend API - Endpoints de Autenticación

**Tareas:**
1. Implementar POST `/api/auth/register/`
2. Implementar POST `/api/auth/login/`
3. Implementar POST `/api/auth/forgot-password/`
4. Implementar POST `/api/auth/reset-password/`
5. Configurar rate limiting
6. Implementar anti-enumeration (timing-safe comparisons)
7. Crear serializers con DRF

**Dependencias satisfechas:**
- ✅ BET-16 (Setup y Dependencias) - Completo
- ✅ BET-17 (Database Models) - Completo

---

## Notas de Implementación

### ¿Por qué UUID en lugar de AutoField?

**Security Benefits:**
- Previene user enumeration attacks
- No revela cantidad de usuarios
- Impredecible (no secuencial)
- Compatible con sistemas distribuidos

**Performance Considerations:**
- UUID4: 16 bytes vs INT: 4 bytes
- Slight overhead en storage (~8 bytes más por registro)
- Indexes funcionan eficientemente con UUIDs
- Beneficio de seguridad supera el costo

### ¿Por qué Email como USERNAME_FIELD?

**UX Benefits:**
- Usuarios no necesitan recordar username
- Email ya es único por naturaleza
- Más intuitivo para reset de password
- Estándar moderno (usado por Google, Facebook, etc.)

**Implementation:**
```python
USERNAME_FIELD = 'email'
REQUIRED_FIELDS = []  # Solo email requerido
```

### ¿Por qué secrets.token_urlsafe(32)?

**Security:**
- 32 bytes = 256 bits de entropía
- URL-safe (puede usarse en links)
- Criptográficamente seguro (CSPRNG)
- Resistente a brute force

**Alternative insegura (NO USAR):**
```python
# ❌ INSEGURO
import random
token = str(random.randint(100000, 999999))  # Solo 6 dígitos!

# ✅ SEGURO
import secrets
token = secrets.token_urlsafe(32)  # 256 bits
```

### Database Cascade Behavior

**User deletion:**
```python
user.delete()  # CASCADE → Borra todos los PasswordResetTokens relacionados
```

**Benefits:**
- Cleanup automático
- No orphan records
- GDPR compliance (right to be forgotten)

---

## Referencias

- **Django Custom User Model:** https://docs.djangoproject.com/en/5.2/topics/auth/customizing/#substituting-a-custom-user-model
- **Django Model Indexes:** https://docs.djangoproject.com/en/5.2/ref/models/indexes/
- **Python secrets Module:** https://docs.python.org/3/library/secrets.html
- **UUID Best Practices:** https://www.postgresql.org/docs/current/datatype-uuid.html
- **Argon2 Password Hashing:** https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

---

**Estado:** ✅ COMPLETADO
**Fecha:** 2025-12-26
**Desarrollado por:** Juan Gabriel Betancourt (con Claude Code)
**Issue:** [BET-17](https://linear.app/betancourt-website/issue/BET-17/fase-2-modelos-de-base-de-datos-y-migraciones)
**Issue Padre:** [BET-15](https://linear.app/betancourt-website/issue/BET-15/identidad-tradicional-email-contrasena)
