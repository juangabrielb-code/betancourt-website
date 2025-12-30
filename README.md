# Producer Hub - Full Stack Application

Proyecto full-stack desarrollado con Django REST Framework (Backend) y Next.js 14 (Frontend), orquestado con Docker Compose.

## Stack Tecnológico

- **Backend**: Django 5.2 + Django REST Framework + PostgreSQL
- **Frontend**: Next.js 16.1 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **Autenticación**: Auth.js v5 (NextAuth) + Prisma + 4 OAuth Providers
- **Base de Datos**: PostgreSQL 16 + Prisma ORM
- **Orquestación**: Docker + Docker Compose
- **Pagos**: Multi-pasarela (Stripe, Bold, Mercado Pago) + Multi-moneda (USD, COP)

## Requisitos Previos

- Docker Desktop instalado y en ejecución
- Docker Compose (incluido en Docker Desktop)

**Nota**: No necesitas instalar Python, Node.js, PostgreSQL ni ninguna otra dependencia en tu máquina local.

## Configuración Inicial

### 1. Clonar el repositorio o navegar a la carpeta del proyecto

```bash
cd betancourt-website
```

### 2. Crear archivo de variables de entorno

```bash
# En Windows
copy .env.example .env

# En Linux/Mac
cp .env.example .env
```

**Importante**: Edita el archivo `.env` y cambia los valores según tus necesidades, especialmente en producción.

**Para Autenticación OAuth**: Genera el `AUTH_SECRET` con:
```bash
openssl rand -base64 32
```
Luego agrega el resultado a tu archivo `.env`.

### 3. Inicializar el proyecto Django

Este comando creará el proyecto Django dentro del contenedor sin necesidad de tener Python instalado localmente:

```bash
docker compose run --rm backend django-admin startproject config .
```

**Explicación**:
- `docker compose run`: Ejecuta un comando en un nuevo contenedor
- `--rm`: Elimina el contenedor después de ejecutar el comando
- `backend`: Nombre del servicio definido en docker-compose.yml
- `django-admin startproject config .`: Crea el proyecto Django llamado "config" en el directorio actual

### 4. Crear una app Django (opcional, por ejemplo "core")

```bash
docker compose run --rm backend python manage.py startapp core
```

### 5. Inicializar el proyecto Next.js

Este comando creará el proyecto Next.js con todas las configuraciones necesarias:

```bash
docker compose run --rm frontend npx create-next-app@latest . --typescript --eslint --tailwind --src-dir --app --import-alias "@/*" --no-turbopack
```

Cuando pregunte por React Compiler, presiona Enter para seleccionar "No" (opción por defecto).

**Nota**: Si aparece un error sobre el directorio no vacío, puedes usar:

```bash
docker compose run --rm frontend sh -c "rm -rf .next node_modules && npx create-next-app@latest . --typescript --eslint --tailwind --src-dir --app --import-alias '@/*' --no-turbopack"
```

## Configuración de Django

### 1. Configurar settings.py

Edita `backend/config/settings.py` y realiza los siguientes cambios:

#### a) Importar decouple y dj_database_url

```python
from decouple import config
import os
```

#### b) Configurar SECRET_KEY y DEBUG

```python
SECRET_KEY = config('SECRET_KEY', default='django-insecure-dev-key')
DEBUG = config('DEBUG', default=True, cast=bool)
```

#### c) Configurar ALLOWED_HOSTS

```python
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')
```

#### d) Agregar apps en INSTALLED_APPS

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
    'core',     # Si creaste esta app
    'payments', # Sistema de pagos multi-pasarela
]
```

#### e) Configurar MIDDLEWARE (agregar CORS)

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Debe estar primero
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

#### f) Configurar la base de datos PostgreSQL

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('POSTGRES_DB', default='producerhub'),
        'USER': config('POSTGRES_USER', default='postgres'),
        'PASSWORD': config('POSTGRES_PASSWORD', default='postgres'),
        'HOST': config('POSTGRES_HOST', default='db'),
        'PORT': config('POSTGRES_PORT', default='5432'),
    }
}
```

#### g) Configurar CORS

Al final del archivo, agrega:

```python
# CORS Settings
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://frontend:3000'
).split(',')

CORS_ALLOW_CREDENTIALS = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

## Ejecutar el Proyecto

### Iniciar todos los servicios

```bash
docker compose up
```

O en modo detached (segundo plano):

```bash
docker compose up -d
```

### Verificar que los servicios están corriendo

```bash
docker compose ps
```

Deberías ver 3 servicios activos:
- `producer-hub-db` (puerto 5432)
- `producer-hub-backend` (puerto 8000)
- `producer-hub-frontend` (puerto 3000)

### Acceder a las aplicaciones

- **Frontend (Next.js)**: http://localhost:3000
- **Backend (Django)**: http://localhost:8000
- **Admin de Django**: http://localhost:8000/admin (después de crear superusuario)

## Comandos Útiles

### Ejecutar migraciones

```bash
docker compose exec backend python manage.py migrate
```

### Crear superusuario de Django

```bash
docker compose exec backend python manage.py createsuperuser
```

### Crear una nueva migración

```bash
docker compose exec backend python manage.py makemigrations
```

### Ejecutar shell de Django

```bash
docker compose exec backend python manage.py shell
```

### Instalar nuevos paquetes de Python

1. Agrega el paquete a `backend/requirements.txt`
2. Reconstruye el contenedor:

```bash
docker compose up -d --build backend
```

### Instalar nuevos paquetes de Node.js

```bash
docker compose exec frontend npm install <paquete>
```

### Ver logs de los servicios

```bash
# Todos los servicios
docker compose logs -f

# Solo backend
docker compose logs -f backend

# Solo frontend
docker compose logs -f frontend

# Solo base de datos
docker compose logs -f db
```

### Detener los servicios

```bash
docker compose down
```

### Detener y eliminar volúmenes (borra la base de datos)

```bash
docker compose down -v
```

### Reconstruir los contenedores

```bash
docker compose up -d --build
```

### Acceder al contenedor con bash

```bash
# Backend
docker compose exec backend bash

# Frontend
docker compose exec frontend sh

# Base de datos
docker compose exec db psql -U postgres -d producerhub
```

## Estructura del Proyecto

```
betancourt-website/
├── backend/
│   ├── config/              # Proyecto Django
│   ├── core/                # App Django (opcional)
│   ├── payments/            # Sistema de pagos multi-pasarela
│   │   ├── models.py        # 4 modelos principales
│   │   ├── admin.py         # Admin con UI enriquecida
│   │   └── migrations/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── entrypoint.sh
│   ├── create_sample_data.py
│   ├── show_data.py
│   └── manage.py
├── frontend/
│   ├── src/
│   │   └── app/
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.ts
├── docker-compose.yml
├── .env
├── .env.example
├── .gitignore
├── README.md
├── PAYMENT_SYSTEM_SUMMARY.md  # Resumen del sistema de pagos
└── WEBHOOKS_FLOW.md           # Flujo técnico de webhooks
```

## Desarrollo

### Hot Reloading

- **Frontend**: Next.js detecta automáticamente los cambios en los archivos
- **Backend**: Django runserver recarga automáticamente cuando detecta cambios en archivos .py

### Tips de Desarrollo

1. Los volúmenes están montados, por lo que cualquier cambio en tu código local se reflejará inmediatamente en los contenedores
2. No necesitas reiniciar los contenedores al hacer cambios en el código
3. Si modificas `requirements.txt` o `package.json`, debes reconstruir el contenedor correspondiente

## Solución de Problemas

### El backend no puede conectarse a la base de datos

Verifica que el servicio `db` esté corriendo:

```bash
docker compose ps db
```

Si no está corriendo, inicia todos los servicios:

```bash
docker compose up -d
```

### Error de permisos en archivos

En Linux/Mac, si tienes problemas de permisos:

```bash
sudo chown -R $USER:$USER backend/ frontend/
```

### El frontend no carga los cambios

Intenta limpiar la caché de Next.js:

```bash
docker compose exec frontend rm -rf .next
docker compose restart frontend
```

### Reiniciar desde cero

Si quieres empezar de nuevo:

```bash
docker compose down -v
docker compose up -d --build
```

## 🔐 Sistema de Autenticación

Betancourt Audio incluye un sistema completo de autenticación social con Auth.js (NextAuth v5) integrado con 4 proveedores OAuth.

### Arquitectura de Autenticación

- **Frontend**: Auth.js v5 (NextAuth) con JWT session strategy
- **Base de Datos**: Prisma ORM con PostgreSQL 16
- **Backend Django**: Modelos read-only con `managed=False` para acceso a datos de usuarios
- **Proveedores OAuth**: Google, Facebook, Apple, Microsoft Entra ID

### Características Implementadas

- ✅ **4 Proveedores OAuth**: Google, Facebook, Apple ID, Microsoft
- ✅ **Protección de Rutas**: Middleware para /dashboard y /admin
- ✅ **Roles de Usuario**: CLIENT (default), ADMIN
- ✅ **Sesiones JWT**: 30 días de duración, actualización cada 24h
- ✅ **UI Moderna**: Modal de autenticación con Framer Motion animations
- ✅ **API REST Django**: Endpoints para gestión de usuarios desde backend
- ✅ **Admin Interface**: Django admin con acceso read-only a usuarios OAuth

### Documentación Detallada

- **[docs/OAUTH_SETUP_GUIDE.md](docs/OAUTH_SETUP_GUIDE.md)** - Guía completa para configurar cada proveedor OAuth
- **[docs/DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** - Checklist de deployment para producción
- **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** - Verificación y testing del sistema

### Inicio Rápido - Autenticación

#### 1. Generar Auth Secret

```bash
openssl rand -base64 32
```

Copia el resultado y agrégalo a `.env` como `AUTH_SECRET`.

#### 2. Configurar OAuth Providers

Para **desarrollo rápido**, puedes usar placeholders en `.env` (el sistema funcionará sin OAuth real):

```bash
AUTH_SECRET=tu-secret-generado-aquí
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@db:5432/betancourt_audio

# Placeholders para desarrollo (reemplazar con credenciales reales)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_FACEBOOK_ID=your-facebook-app-id
AUTH_FACEBOOK_SECRET=your-facebook-app-secret
AUTH_APPLE_ID=your-apple-service-id
AUTH_APPLE_SECRET=your-apple-private-key
AUTH_MICROSOFT_ENTRA_ID_ID=your-microsoft-client-id
AUTH_MICROSOFT_ENTRA_ID_SECRET=your-microsoft-client-secret
```

Para **configurar credenciales OAuth reales**, sigue la guía detallada: [docs/OAUTH_SETUP_GUIDE.md](docs/OAUTH_SETUP_GUIDE.md)

#### 3. Inicializar Base de Datos de Autenticación

Las tablas ya están creadas. Para verificar:

```bash
# Conectar a la base de datos
docker compose exec db psql -U postgres -d betancourt_audio

# Ver tablas de autenticación
\dt

# Deberías ver: users, accounts, sessions, verification_tokens
```

#### 4. Acceder al Sistema

1. **Frontend con Auth**: http://localhost:3000
   - Click en "Sign In" para ver modal de autenticación
   - 4 botones de proveedores sociales
   - Theme toggle (light/dark) funcional
   - Language toggle (EN/ES) funcional

2. **Dashboard Protegido**: http://localhost:3000/dashboard
   - Requiere autenticación
   - Muestra información del usuario
   - Quick actions disponibles

3. **Admin Panel**: http://localhost:3000/admin
   - Requiere rol ADMIN
   - Gestión de sistema completa

4. **Django Auth API**: http://localhost:8000/api/auth/
   - `GET /api/auth/users/` - Lista de usuarios
   - `GET /api/auth/users/stats/` - Estadísticas de usuarios
   - `GET /api/auth/accounts/` - Cuentas OAuth vinculadas
   - `GET /api/auth/sessions/` - Sesiones activas

### Estructura del Sistema de Autenticación

```
frontend/
├── prisma/
│   └── schema.prisma              # Schema con 4 modelos Auth.js
├── src/
│   ├── auth.ts                    # Configuración Auth.js principal
│   ├── lib/
│   │   └── prisma.ts              # Singleton Prisma client
│   ├── middleware.ts              # Protección de rutas
│   ├── app/
│   │   ├── api/auth/
│   │   │   └── [...nextauth]/    # API routes Auth.js
│   │   ├── dashboard/             # Página protegida
│   │   └── admin/                 # Página protegida (ADMIN only)
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthModal.tsx     # Modal con 4 proveedores
│   │   ├── shared/
│   │   │   └── Navbar.tsx        # Navbar con auth state
│   │   └── ClientProviders.tsx   # SessionProvider wrapper
│   └── contexts/
│       └── AuthContext.tsx        # useAuth hook

backend/
├── authentication/
│   ├── models.py                  # Modelos read-only (managed=False)
│   │   ├── AuthUser
│   │   ├── AuthAccount
│   │   ├── AuthSession
│   │   └── VerificationToken
│   ├── serializers.py             # DRF serializers
│   ├── views.py                   # ViewSets con stats endpoints
│   ├── urls.py                    # API routes /api/auth/
│   └── admin.py                   # Django admin read-only
```

### Crear Usuario Admin Manualmente

Si necesitas dar rol ADMIN a un usuario:

```bash
# Conectar a DB
docker compose exec db psql -U postgres -d betancourt_audio

# Actualizar rol
UPDATE users SET role = 'ADMIN' WHERE email = 'tu-email@ejemplo.com';

# Verificar
SELECT email, role FROM users WHERE role = 'ADMIN';

# Salir
\q
```

### Testing del Sistema de Autenticación

Ver el checklist completo de testing: [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)

**Resumen de Tests Ejecutados:**
- ✅ 82 tests pasados
- ⏸️ 13 tests pendientes (requieren credenciales OAuth reales)
- ⚠️ 2 warnings no-bloqueantes

**Estado:** Sistema funcional y listo para configuración de credenciales OAuth.

### Troubleshooting Común

#### Error: "redirect_uri_mismatch"
Verifica que las redirect URIs en las consolas OAuth coincidan exactamente con:
```
http://localhost:3000/api/auth/callback/{provider}
```

#### Sesión no persiste
- Verifica que `AUTH_SECRET` esté configurado
- Verifica que `NEXTAUTH_URL` coincida con tu dominio actual
- Limpia cookies del navegador

#### Modal no aparece
- Verifica que `z-index` es suficientemente alto (9999)
- Revisa la consola del navegador por errores
- Verifica que ClientProviders está wrapping tu app

Para más soluciones, consulta: [docs/OAUTH_SETUP_GUIDE.md#troubleshooting](docs/OAUTH_SETUP_GUIDE.md#troubleshooting)

---

## 💳 Sistema de Pagos

Producer Hub incluye un sistema completo de pagos multi-pasarela y multi-moneda. Ver documentación detallada en:

- **[PAYMENT_SYSTEM_SUMMARY.md](PAYMENT_SYSTEM_SUMMARY.md)** - Resumen completo del sistema implementado
- **[WEBHOOKS_FLOW.md](WEBHOOKS_FLOW.md)** - Flujo de webhooks y documentación técnica

### Características del Sistema de Pagos

- ✅ **Multi-Moneda**: USD y COP con conversión automática
- ✅ **Multi-Pasarela**: Stripe (USD → Payoneer), Bold y Mercado Pago (COP)
- ✅ **Impuestos Colombia**: Cálculo automático de IVA (19%)
- ✅ **Trazabilidad**: Almacenamiento completo de webhooks y respuestas de pasarelas
- ✅ **Historial**: Tasas de cambio históricas para auditoría

### Modelos Disponibles

1. **Service**: Servicios con precios en USD y COP
2. **Order**: Órdenes de pago con cálculo automático de impuestos
3. **Transaction**: Transacciones con almacenamiento de webhooks
4. **ExchangeRate**: Tasas de cambio históricas

### Ver Datos del Sistema de Pagos

```bash
# Ver resumen de todos los datos
docker compose exec backend python show_data.py

# Crear datos de ejemplo
docker compose exec backend python create_sample_data.py
```

### Acceder al Admin de Pagos

1. Navega a http://localhost:8000/admin
2. Usuario: `admin`
3. Contraseña: `admin123`
4. Explora las secciones: **Services**, **Orders**, **Transactions**, **Exchange Rates**

### Estructura de la App de Pagos

```
backend/payments/
├── models.py              # 4 modelos (Service, Order, Transaction, ExchangeRate)
├── admin.py               # Admin con badges de colores y JSON viewer
├── migrations/
│   └── 0001_initial.py
└── ...
```

## Producción

Para producción, deberías:

1. Cambiar `DEBUG=False` en el archivo `.env`
2. Generar una nueva `SECRET_KEY` segura
3. Usar contraseñas fuertes para PostgreSQL
4. Configurar un servidor web como Nginx
5. Usar un servidor WSGI como Gunicorn (ya incluido)
6. Configurar HTTPS con certificados SSL

## Licencia

[Tu licencia aquí]

## Contacto

[Tu información de contacto]
