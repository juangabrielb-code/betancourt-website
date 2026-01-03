# BET-39: Panel de Administración Dinámico (SaaS Style)

> **Tipo:** Feature | **Prioridad:** MVP (Agilidad de Negocio) | **Estimación:** L
> **Dependencia:** BET-38 (Modelos de datos CMS)

---

## 1. Problema

**Situación actual:**
- El admin panel (`/admin`) existe pero es solo UI mockup sin lógica
- No hay conexión con backend para CRUD de servicios/portfolio
- Los datos están hardcodeados en el frontend
- No hay integración de storage para archivos

**Impacto:** El administrador no puede gestionar contenido. Cada cambio requiere modificar código y deploy.

---

## 2. Solución Propuesta

Construir un panel de administración dinámico en Next.js que:
- Consuma la API REST de Django (creada en BET-38)
- Permita CRUD completo de servicios y portfolio
- Detecte automáticamente el tipo de media (YouTube/Spotify/SoundCloud)
- Suba archivos a Supabase Storage (tier gratuito)
- Use Shadcn/UI para una UX profesional

**Métricas de Éxito:**
- Admin puede crear/editar/eliminar servicios sin código
- Admin puede gestionar portfolio con preview de embeds
- Cambios reflejados en el frontend público instantáneamente (revalidación)
- Cero hardcode de datos en componentes

---

## 3. Decisiones de Arquitectura

| Decisión | Opción Elegida | Rationale |
|----------|----------------|-----------|
| UI Library | Migrar a Shadcn/UI | Componentes profesionales, forms con react-hook-form + zod, tables, charts. Estándar SaaS 2025 |
| Arquitectura CRUD | Next.js + Django API | Panel admin en Next.js consumiendo API REST. Mayor control de UX, revalidación instantánea |
| Storage | Supabase Storage | 1GB gratis, SDK simple, PostgreSQL ya en uso. Ideal para audio/imágenes del portafolio |
| Media Embed | Regex + componente dinámico | Detectar proveedor por URL, renderizar iframe correcto. Sin dependencias externas |
| Dependencia | BET-38 primero | Backend con modelos y API debe estar listo antes del admin panel |
| CMS Config | Mantenimiento + Ocultar precios | Dos switches de configuración global para MVP |

---

## 4. Alcance MVP (MoSCoW)

### Must Have (MVP)

**4.1 Instalación y configuración de Shadcn/UI**
- Instalar Shadcn/UI en el proyecto Next.js
- Configurar componentes base: Button, Input, Form, Table, Dialog, Select, Switch, Tabs
- Mantener compatibilidad con UI custom existente en páginas públicas

**4.2 Layout de Admin con Shadcn**
- Sidebar navegable con secciones: Dashboard, Servicios, Portfolio, Configuración
- Header con info del usuario admin y logout
- Responsive (sidebar colapsable en mobile)
- Protección de rutas solo para rol ADMIN

**4.3 CRUD de Servicios**
- Tabla de servicios con columnas: nombre, precio COP, precio USD, orden, estado
- Ordenamiento drag-and-drop o por input numérico
- Modal/drawer para crear/editar servicio
- Formulario con validación (zod): nombre requerido, precios > 0
- Confirmación antes de eliminar
- Llamadas a API Django: GET/POST/PUT/DELETE `/api/cms/services/`

**4.4 CRUD de Portfolio**
- Tabla de items con columnas: título, artista, categoría, tipo, estado
- Filtros por categoría y tipo de contenido
- Modal para crear/editar item
- Componente de detección de media:
  - Input de URL
  - Detectar automáticamente: YouTube, Spotify, SoundCloud
  - Mostrar preview del embed antes de guardar
- Subida de imagen de portada a Supabase Storage
- Subida de audio (si tipo=FILE) a Supabase Storage

**4.5 Integración Supabase Storage**
- Configurar cliente Supabase en Next.js
- Bucket para portfolio: `portfolio-media`
- Funciones de upload para imágenes y audio
- Validación de tamaño (50MB max para audio)
- Retornar URL pública para guardar en Django

**4.6 Detector de Media Embed**
- Función que recibe URL y retorna:
  - `provider`: 'youtube' | 'spotify' | 'soundcloud' | 'unknown'
  - `embedUrl`: URL formateada para iframe
  - `embedHtml`: HTML del iframe listo para renderizar
- Componente `MediaPreview` que muestra el embed
- Validación: rechazar URLs no soportadas

**4.7 Configuración Global CMS**
- Modelo en Django: `SiteConfig` con campos:
  - `maintenance_mode`: boolean
  - `hide_prices`: boolean
- Endpoint: GET/PUT `/api/cms/config/`
- UI: Página de configuración con switches
- Frontend público: leer config y aplicar (mostrar página de mantenimiento, ocultar precios)

**4.8 Revalidación Instantánea**
- Usar `revalidatePath` o `revalidateTag` de Next.js
- Al guardar en admin, invalidar cache de páginas públicas
- Los visitantes ven cambios inmediatamente sin esperar rebuild

### Should Have (Post-MVP)

- Dashboard con estadísticas (total servicios, items portfolio, visitas)
- Historial de cambios / audit log
- Bulk actions (activar/desactivar múltiples items)
- Editor de texto enriquecido para descripciones
- Preview de cómo se ve en el sitio público

### Won't Have (Fuera de alcance)

- CMS para otras secciones (about, contact, etc.)
- Sistema de usuarios/roles avanzado (solo admin/client por ahora)
- Versionado de contenido
- Programación de publicaciones

---

## 5. Especificaciones Técnicas

### 5.1 Componentes Shadcn Requeridos

| Componente | Uso |
|------------|-----|
| Button | Acciones primarias/secundarias |
| Input | Campos de texto |
| Form | Wrapper con react-hook-form |
| Table | Listados de servicios/portfolio |
| Dialog | Modales de crear/editar |
| Select | Dropdowns (categoría, tipo) |
| Switch | Toggles (activo, mantenimiento) |
| Tabs | Navegación en formularios |
| Card | Contenedores de secciones |
| Badge | Estados (activo/inactivo) |
| Skeleton | Loading states |
| Toast | Notificaciones de éxito/error |
| AlertDialog | Confirmación de eliminación |

### 5.2 Estructura de Rutas Admin

```
/admin
├── /admin                    → Dashboard overview
├── /admin/services           → CRUD servicios
├── /admin/services/new       → Crear servicio
├── /admin/services/[id]      → Editar servicio
├── /admin/portfolio          → CRUD portfolio
├── /admin/portfolio/new      → Crear item
├── /admin/portfolio/[id]     → Editar item
└── /admin/settings           → Configuración CMS
```

### 5.3 Endpoints Django Requeridos (de BET-38 + nuevos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/payments/services/` | Lista servicios (admin) |
| POST | `/api/payments/services/` | Crear servicio |
| PUT | `/api/payments/services/{id}/` | Actualizar servicio |
| DELETE | `/api/payments/services/{id}/` | Eliminar servicio |
| GET | `/api/cms/categories/` | Lista categorías |
| POST | `/api/cms/categories/` | Crear categoría |
| GET | `/api/cms/portfolio/` | Lista portfolio |
| POST | `/api/cms/portfolio/` | Crear item |
| PUT | `/api/cms/portfolio/{id}/` | Actualizar item |
| DELETE | `/api/cms/portfolio/{id}/` | Eliminar item |
| GET | `/api/cms/config/` | Obtener config global |
| PUT | `/api/cms/config/` | Actualizar config global |

### 5.4 Modelo SiteConfig (Django)

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| id | UUID | Auto | PK (singleton) |
| maintenance_mode | BooleanField | False | Mostrar página de mantenimiento |
| hide_prices | BooleanField | False | Ocultar precios en frontend |
| updated_at | DateTimeField | Auto | Última modificación |
| updated_by | ForeignKey(User) | Null | Quién modificó |

### 5.5 Regex para Detección de Media

```
YouTube:
- youtube.com/watch?v={id}
- youtu.be/{id}
- youtube.com/embed/{id}

Spotify:
- open.spotify.com/track/{id}
- open.spotify.com/album/{id}
- open.spotify.com/playlist/{id}

SoundCloud:
- soundcloud.com/{user}/{track}
- soundcloud.com/{user}/sets/{playlist}
```

### 5.6 Configuración Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx (solo server-side)
```

**Bucket policy:**
- `portfolio-media`: público para lectura, autenticado para escritura
- Carpetas: `/covers/`, `/audio/`
- Límites: 50MB por archivo

---

## 6. Criterios de Aceptación

### AC-1: Instalación Shadcn
```gherkin
GIVEN un desarrollador en el proyecto
WHEN ejecuta el script de instalación de Shadcn
THEN los componentes se instalan correctamente
AND coexisten con los componentes UI custom existentes
AND el build de Next.js completa sin errores
```

### AC-2: CRUD Servicios
```gherkin
GIVEN un administrador autenticado en /admin/services
WHEN crea un nuevo servicio con nombre "Mastering" y precios
THEN el servicio aparece en la tabla inmediatamente
AND el frontend público muestra el nuevo servicio sin deploy
AND los precios se validan como mayores a 0
```

### AC-3: Detección de Media
```gherkin
GIVEN un administrador creando un item de portfolio
WHEN pega una URL de YouTube "https://youtube.com/watch?v=abc123"
THEN el sistema detecta automáticamente que es YouTube
AND muestra un preview del video embebido
AND al guardar, el embed funciona en el frontend público
```

### AC-4: Subida a Supabase
```gherkin
GIVEN un administrador subiendo una imagen de portada
WHEN selecciona un archivo JPG de 2MB
THEN el archivo se sube a Supabase Storage
AND se muestra preview de la imagen
AND la URL pública se guarda en el item de portfolio
```

### AC-5: Configuración Global
```gherkin
GIVEN un administrador en /admin/settings
WHEN activa el switch "Modo Mantenimiento"
THEN el frontend público muestra página de mantenimiento
AND los visitantes no pueden ver el contenido normal
AND el admin puede desactivarlo para restaurar el sitio
```

### AC-6: Seguridad de Rol
```gherkin
GIVEN un usuario con rol CLIENT
WHEN intenta acceder a /admin
THEN es redirigido a /dashboard
AND no puede ver las rutas de administración
```

### AC-7: Revalidación Instantánea
```gherkin
GIVEN un administrador que guarda un cambio en servicios
WHEN el cambio se guarda exitosamente
THEN el cache de la página pública se invalida
AND un visitante que recarga ve el cambio inmediatamente
```

---

## 7. Instrucciones de Implementación

### Para la IA / Desarrollador:

**Paso 1: Instalar Shadcn/UI**
1. Ejecutar `npx shadcn@latest init` en `/frontend`
2. Seleccionar estilo "New York", color base "Slate"
3. Configurar `tailwind.config.ts` para compatibilidad con CSS existente
4. Instalar componentes necesarios: `npx shadcn@latest add button input form table dialog select switch tabs card badge skeleton toast alert-dialog`
5. Verificar que el build funciona sin conflictos

**Paso 2: Crear Layout de Admin**
1. Crear `src/app/admin/layout.tsx` con sidebar + header
2. Implementar navegación con links a secciones
3. Agregar componente de usuario con logout
4. Hacer sidebar responsive (colapsable en mobile)
5. Verificar protección de rol ADMIN en middleware

**Paso 3: Implementar CRUD de Servicios**
1. Crear página `src/app/admin/services/page.tsx` con tabla de servicios
2. Crear componente `ServiceForm` con react-hook-form + zod
3. Implementar hooks para CRUD: `useServices`, `useCreateService`, `useUpdateService`, `useDeleteService`
4. Agregar funcionalidad de reordenamiento (drag-drop o input numérico)
5. Implementar confirmación antes de eliminar
6. Agregar toasts de éxito/error

**Paso 4: Implementar Detector de Media**
1. Crear `src/lib/media-detector.ts` con función `detectMediaProvider(url)`
2. Implementar regex para YouTube, Spotify, SoundCloud
3. Crear componente `MediaPreview` que renderiza el embed
4. Integrar en formulario de portfolio con preview en tiempo real

**Paso 5: Configurar Supabase Storage**
1. Crear proyecto en Supabase (tier gratuito)
2. Crear bucket `portfolio-media` con política pública de lectura
3. Agregar variables de entorno en `.env.local`
4. Crear `src/lib/supabase.ts` con cliente configurado
5. Crear funciones `uploadCoverImage(file)` y `uploadAudioFile(file)`
6. Integrar en formulario de portfolio

**Paso 6: Implementar CRUD de Portfolio**
1. Crear página `src/app/admin/portfolio/page.tsx` con tabla filtrable
2. Crear componente `PortfolioForm` con campos dinámicos según tipo
3. Integrar MediaPreview para URLs de embed
4. Integrar upload de imagen y audio
5. Agregar selección de categoría

**Paso 7: Implementar Configuración Global**
1. Crear modelo `SiteConfig` en Django (BET-38 extendido o nuevo)
2. Crear endpoints GET/PUT para config
3. Crear página `src/app/admin/settings/page.tsx` con switches
4. Crear hook `useSiteConfig` para leer/actualizar
5. En frontend público, leer config y aplicar (mantenimiento, ocultar precios)

**Paso 8: Implementar Revalidación**
1. En cada acción de guardado, llamar `revalidatePath('/services')` o equivalente
2. Configurar tags de cache para invalidación granular
3. Probar que cambios se reflejan inmediatamente en frontend público

---

## 8. Dependencias

| Dependencia | Versión | Propósito | Estado |
|-------------|---------|-----------|--------|
| @shadcn/ui | latest | Componentes UI | Instalar |
| react-hook-form | ^7.x | Manejo de forms | Instalar |
| zod | ^3.x | Validación | Instalar |
| @supabase/supabase-js | ^2.x | Cliente Supabase | Instalar |
| @tanstack/react-table | ^8.x | Tablas avanzadas | Opcional |
| @dnd-kit/core | ^6.x | Drag and drop | Opcional |

---

## 9. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Conflicto Shadcn con UI custom | Media | Medio | Shadcn solo en /admin, mantener UI custom en público |
| Límite de storage Supabase (1GB) | Media | Alto | Validar tamaño, sugerir embeds para audio grande |
| API Django no lista (BET-38 pendiente) | Alta | Alto | Implementar BET-38 primero |
| Revalidación no funciona correctamente | Baja | Medio | Probar con diferentes estrategias de cache |
| Embeds bloqueados por CORS | Baja | Medio | Usar iframes con sandbox apropiado |

---

## 10. Fuera de Alcance (Explícito)

- **NO** crear CMS para otras secciones (about, contact, testimonios)
- **NO** implementar sistema de usuarios/roles avanzado
- **NO** agregar versionado de contenido
- **NO** implementar programación de publicaciones
- **NO** crear editor visual WYSIWYG completo
- **NO** migrar páginas públicas a Shadcn (solo admin)

---

## 11. Definition of Done

- [ ] Shadcn/UI instalado y configurado sin conflictos
- [ ] Layout de admin con sidebar navegable
- [ ] CRUD completo de servicios funcionando
- [ ] CRUD completo de portfolio funcionando
- [ ] Detección automática de media (YouTube/Spotify/SoundCloud) con preview
- [ ] Subida de archivos a Supabase Storage funcionando
- [ ] Configuración global (mantenimiento + ocultar precios) funcionando
- [ ] Revalidación instantánea del frontend público
- [ ] Protección de rutas solo para ADMIN
- [ ] Formularios con validación zod
- [ ] Notificaciones toast de éxito/error
- [ ] Responsive en mobile

---

## 12. Relación con BET-38

**BET-38** crea:
- Modelo Service extendido con `display_order`
- App CMS con modelos Category y PortfolioItem
- Validador de archivos de audio
- API endpoints read-only

**BET-39** agrega:
- Endpoints write (POST/PUT/DELETE) para servicios y portfolio
- Modelo SiteConfig para configuración global
- Panel admin en Next.js que consume toda la API
- Integración con Supabase Storage

**Orden de implementación:**
1. Completar BET-38 (backend + API)
2. Implementar BET-39 (admin panel frontend)

---

*Documento generado siguiendo mejores prácticas PRD 2025-2026*
*Última actualización: 2026-01-03*

**Sources:**
- [Next.js Shadcn Dashboard Starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)
- [Vercel Admin Dashboard Template](https://vercel.com/templates/next.js/next-js-and-shadcn-ui-admin-dashboard)
- [Best Next.js Admin Templates 2026](https://nextjstemplates.com/blog/admin-dashboard-templates)
