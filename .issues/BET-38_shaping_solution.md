# BET-38: Modelos de Datos para CMS (Servicios y Portafolio)

> **Tipo:** Feature | **Prioridad:** MVP Critical | **Estimación:** S

---

## 1. Problema

**Situación actual:** Los precios de servicios y el portafolio de trabajos están hardcodeados en el frontend (HTML/React). Esto genera:

- Dependencia del desarrollador para cualquier cambio de precio
- Imposibilidad de agregar nuevos trabajos al portafolio sin deploy
- Riesgo de inconsistencias entre lo mostrado y lo cobrado
- Escalabilidad nula para gestión de contenido

**Impacto:** El administrador no puede operar de forma autónoma. Cada cambio menor requiere intervención técnica.

---

## 2. Solución Propuesta

Crear una capa de datos en Django que permita gestionar servicios y portafolio desde el panel de administración, exponiendo estos datos via API REST para consumo del frontend.

**Métricas de Éxito:**
- El admin puede crear/editar/eliminar servicios sin tocar código
- El admin puede gestionar el portafolio completo desde `/admin`
- El frontend consume datos dinámicos via API
- Tiempo de actualización de contenido: < 2 minutos (vs deploy actual)

---

## 3. Decisiones de Arquitectura

| Decisión | Opción Elegida | Rationale |
|----------|----------------|-----------|
| Ubicación de Service | Extender modelo existente en `payments/` | Ya tiene precios USD/COP con DecimalField. Evita duplicidad. Solo falta `display_order` |
| Ubicación de PortfolioItem | Nueva app `cms/` | Separación lógica. El portafolio es contenido visual, no transaccional |
| Categorías del portfolio | Modelo `Category` separado | Flexibilidad para editar categorías sin código. Permite expansión futura |
| Validación de audio | Función nativa Django (MIME + Size + Extension) | Sin dependencias externas. Control total. Seguridad robusta |

---

## 4. Alcance MVP (MoSCoW)

### Must Have (MVP)

**4.1 Extender modelo Service existente**
- Agregar campo `display_order` (PositiveIntegerField) para controlar orden de aparición
- Actualizar ordenamiento por defecto: primero por `display_order`, luego por fecha
- Actualizar admin para permitir edición inline del orden

**4.2 Crear app CMS con modelo Category**
- Campos requeridos: `name`, `slug` (auto-generado), `display_order`, `is_active`
- El slug debe generarse automáticamente desde el nombre
- Admin con edición inline de orden y estado activo

**4.3 Crear modelo PortfolioItem**
- Información básica: `title`, `client_name`, `description`, `category` (FK)
- Tipo de contenido: campo choice con opciones FILE, YOUTUBE, SPOTIFY, SOUNDCLOUD
- Media: `embed_url` (para externos), `audio_file` (FileField), `cover_image` (ImageField)
- Metadata: `display_order`, `is_featured`, `is_active`, `release_date`
- Validación condicional: si tipo=FILE requiere audio_file; si tipo!=FILE requiere embed_url

**4.4 Validador de archivos de audio**
- Validar extensiones permitidas: .mp3, .wav, .flac
- Validar tamaño máximo: 50MB
- Validar MIME type real usando magic numbers (previene archivos renombrados maliciosos)
- Validar coherencia entre extensión y contenido real

**4.5 Configuración de media files**
- Verificar que MEDIA_URL y MEDIA_ROOT estén configurados
- Crear estructura de carpetas: `portfolio/audio/YYYY/MM/` y `portfolio/covers/YYYY/MM/`
- Servir archivos en desarrollo

**4.6 API Endpoints (Read-Only)**
- `GET /api/cms/categories/` - Lista categorías activas ordenadas
- `GET /api/cms/portfolio/` - Lista items activos con categoría anidada
- Filtros: por categoría (slug), por tipo de contenido, por destacados
- Incluir URLs absolutas para archivos de audio e imágenes

### Should Have (Post-MVP)

- Paginación en endpoints de portfolio
- Endpoint para servicios: `GET /api/payments/services/`
- Cache de respuestas API
- Optimización de queries con `select_related`

### Won't Have (Fuera de alcance)

- Panel de administración custom en Next.js (ticket separado)
- Almacenamiento en S3/Cloud Storage
- Streaming de audio
- Estadísticas de reproducciones

---

## 5. Especificaciones Técnicas

### 5.1 Modelo Category

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | UUID | Auto | Primary key |
| name | CharField(100) | Sí | Único |
| slug | SlugField(100) | Auto | Generado desde name, único |
| description | TextField | No | Para uso futuro |
| display_order | PositiveIntegerField | Sí | Default: 0 |
| is_active | BooleanField | Sí | Default: True |
| created_at | DateTimeField | Auto | - |
| updated_at | DateTimeField | Auto | - |

### 5.2 Modelo PortfolioItem

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| id | UUID | Auto | Primary key |
| title | CharField(255) | Sí | - |
| client_name | CharField(255) | Sí | Nombre del artista/banda |
| category | ForeignKey(Category) | Sí | on_delete=PROTECT |
| description | TextField | No | - |
| content_type | CharField(20) | Sí | Choices: FILE, YOUTUBE, SPOTIFY, SOUNDCLOUD |
| embed_url | URLField | Condicional | Requerido si content_type != FILE |
| audio_file | FileField | Condicional | Requerido si content_type = FILE. Max 50MB |
| cover_image | ImageField | No | Thumbnail para el portafolio |
| display_order | PositiveIntegerField | Sí | Default: 0 |
| is_featured | BooleanField | Sí | Default: False |
| is_active | BooleanField | Sí | Default: True |
| release_date | DateField | No | Fecha de lanzamiento del trabajo |
| created_at | DateTimeField | Auto | - |
| updated_at | DateTimeField | Auto | - |

### 5.3 Extensión a Service (payments)

| Campo a agregar | Tipo | Default | Notas |
|-----------------|------|---------|-------|
| display_order | PositiveIntegerField | 0 | Menor número = aparece primero |

Actualizar `ordering` en Meta: `['display_order', '-created_at']`

### 5.4 Reglas de Validación

**Precios (ya existente en Service):**
- Validar que precio > 0 (MinValueValidator ya implementado)

**Archivos de audio:**
- Extensiones permitidas: `.mp3`, `.wav`, `.flac`
- Tamaño máximo: 50 MB
- Validar MIME type real contra extensión declarada
- Rechazar si hay discrepancia (posible archivo malicioso)

**Lógica condicional PortfolioItem:**
- Si `content_type = FILE`: `audio_file` es requerido, `embed_url` es opcional
- Si `content_type != FILE`: `embed_url` es requerido, `audio_file` es opcional

---

## 6. Criterios de Aceptación

### AC-1: Gestión de Servicios
```gherkin
GIVEN un administrador autenticado en /admin
WHEN accede a la sección de Servicios
THEN puede ver todos los servicios con nombre, precio COP, precio USD y orden
AND puede editar el orden de visualización inline
AND puede activar/desactivar servicios sin eliminarlos
```

### AC-2: Gestión de Categorías
```gherkin
GIVEN un administrador autenticado en /admin
WHEN crea una nueva categoría ingresando solo el nombre
THEN el sistema genera automáticamente el slug
AND la categoría aparece en el listado ordenada por display_order
```

### AC-3: Gestión de Portfolio
```gherkin
GIVEN un administrador autenticado en /admin
WHEN crea un nuevo item de portfolio con tipo "Archivo Local"
THEN el sistema requiere subir un archivo de audio
AND valida que el archivo sea MP3, WAV o FLAC
AND valida que el tamaño no exceda 50MB
AND rechaza archivos con extensión falsa (ej: .exe renombrado a .mp3)
```

### AC-4: Validación de Embed
```gherkin
GIVEN un administrador creando un item de portfolio
WHEN selecciona tipo "YouTube", "Spotify" o "SoundCloud"
THEN el sistema requiere ingresar URL de embed
AND el campo de archivo de audio se vuelve opcional
```

### AC-5: API de Categorías
```gherkin
GIVEN el endpoint GET /api/cms/categories/
WHEN se realiza una petición sin autenticación
THEN retorna lista de categorías activas
AND cada categoría incluye: id, name, slug, description
AND están ordenadas por display_order ascendente
```

### AC-6: API de Portfolio
```gherkin
GIVEN el endpoint GET /api/cms/portfolio/
WHEN se realiza una petición con filtro ?is_featured=true
THEN retorna solo items marcados como destacados
AND cada item incluye la categoría anidada (no solo el ID)
AND incluye URLs absolutas para audio_file y cover_image
```

### AC-7: Precios No Negativos
```gherkin
GIVEN un administrador editando un servicio
WHEN intenta guardar un precio menor o igual a 0
THEN el sistema muestra error de validación
AND no guarda el cambio
```

---

## 7. Instrucciones de Implementación

### Para la IA / Desarrollador:

**Paso 1: Extender Service**
1. Abrir `backend/payments/models.py`
2. Agregar campo `display_order` al modelo Service con default=0
3. Actualizar `ordering` en Meta para priorizar `display_order`
4. Actualizar `backend/payments/admin.py` para mostrar y permitir edición inline de `display_order`
5. Crear migración con nombre descriptivo

**Paso 2: Crear app CMS**
1. Ejecutar `python manage.py startapp cms` dentro de `/backend`
2. Agregar `'cms'` a `INSTALLED_APPS` en settings.py
3. Crear archivo `validators.py` con función de validación de audio
4. Implementar modelos Category y PortfolioItem en `models.py`
5. Configurar admin.py con list_display, list_filter, list_editable, search_fields
6. Usar prepopulated_fields para auto-generar slug desde name

**Paso 3: Implementar Validador de Audio**
1. Crear función que reciba el archivo como parámetro
2. Verificar extensión contra lista blanca
3. Verificar tamaño contra límite (50MB)
4. Usar librería `python-magic` para detectar MIME type real
5. Comparar MIME detectado contra extensión declarada
6. Lanzar ValidationError descriptivo si falla cualquier verificación

**Paso 4: Crear API**
1. Crear `serializers.py` con CategorySerializer y PortfolioItemSerializer
2. En PortfolioItemSerializer: anidar CategorySerializer, agregar métodos para URLs absolutas
3. Crear `views.py` con ReadOnlyModelViewSet para ambos modelos
4. Filtrar solo registros activos en queryset base
5. Crear `urls.py` con router de DRF
6. Registrar rutas en `config/urls.py`

**Paso 5: Migraciones y Pruebas**
1. Generar migraciones para payments (display_order) y cms (Category, PortfolioItem)
2. Aplicar migraciones
3. Crear superusuario si no existe
4. Probar creación de categoría en admin
5. Probar subida de archivo de audio válido
6. Probar rechazo de archivo inválido
7. Probar endpoints API

---

## 8. Dependencias

| Dependencia | Versión | Propósito | Ya instalada? |
|-------------|---------|-----------|---------------|
| Django REST Framework | >=3.14 | API endpoints | Sí |
| Pillow | >=10.0 | ImageField | Verificar |
| python-magic | >=0.4.27 | Validación MIME | No - Agregar |

---

## 9. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Archivos de audio muy pesados saturan servidor | Media | Alto | Límite de 50MB. Futuro: migrar a S3/Cloud Storage |
| Archivos maliciosos disfrazados de audio | Baja | Alto | Validación de MIME type con magic numbers |
| Inconsistencia modelo Service duplicado | N/A | N/A | Resuelto: extender existente, no crear nuevo |
| Categorías insuficientes post-launch | Baja | Bajo | Modelo Category separado permite agregar sin código |

---

## 10. Fuera de Alcance (Explícito)

- **NO** crear panel de administración custom en Next.js (será ticket separado)
- **NO** implementar almacenamiento en la nube (S3, Supabase, etc.)
- **NO** agregar streaming de audio o reproductor custom
- **NO** implementar analytics de reproducciones
- **NO** crear endpoints de escritura (POST/PUT/DELETE) - solo lectura para frontend
- **NO** agregar autenticación a los endpoints de lectura

---

## 11. Definition of Done

- [ ] Campo `display_order` agregado a Service y funcionando en admin
- [ ] App `cms` creada y registrada en INSTALLED_APPS
- [ ] Modelo Category con auto-generación de slug funcionando
- [ ] Modelo PortfolioItem con validación condicional funcionando
- [ ] Validador de audio rechaza archivos inválidos con mensaje claro
- [ ] Subida de archivos de audio funciona en admin
- [ ] Subida de imágenes de portada funciona en admin
- [ ] Endpoint `/api/cms/categories/` retorna datos correctos
- [ ] Endpoint `/api/cms/portfolio/` retorna datos con categoría anidada
- [ ] Filtros de portfolio funcionan (categoría, featured, content_type)
- [ ] Migraciones aplicadas sin errores
- [ ] No hay código hardcodeado de servicios o portfolio en el frontend

---

*Documento generado siguiendo mejores prácticas PRD 2025-2026*
*Última actualización: 2026-01-03*
