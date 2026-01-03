#!/usr/bin/env python3
"""
Script para crear issues de roadmap en Linear para BET-38
"""
import requests
import json

import os
API_KEY = os.environ.get("LINEAR_API_KEY", "")
TEAM_ID = "fcbc0918-e222-4064-bf18-c8953761ac30"
PARENT_ID = "e26c23a8-4c4a-498d-a95e-5a8fec8f3d6f"  # BET-38
BACKLOG_STATE = "27e367fb-437c-458d-9d2e-6c48f85d2fe2"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": API_KEY
}

URL = "https://api.linear.app/graphql"

# Sub-issues a crear
ISSUES = [
    {
        "title": "Extender modelo Service con display_order",
        "description": """## Objetivo
Agregar campo display_order al modelo Service existente en payments/

## Tareas
1. Agregar campo `display_order` (PositiveIntegerField, default=0) a Service
2. Actualizar `ordering` en Meta: `['display_order', '-created_at']`
3. Actualizar admin.py para mostrar y editar display_order inline
4. Crear migración con nombre descriptivo

## Criterio de Aceptación
- Admin puede reordenar servicios sin tocar código
- Servicios se muestran ordenados por display_order en API

## Archivos a modificar
- `backend/payments/models.py`
- `backend/payments/admin.py`
""",
        "priority": 1
    },
    {
        "title": "Crear app CMS con modelo Category",
        "description": """## Objetivo
Crear nueva app Django `cms` con modelo Category para categorías del portafolio

## Tareas
1. Ejecutar `python manage.py startapp cms` dentro de /backend
2. Agregar 'cms' a INSTALLED_APPS en settings.py
3. Crear modelo Category con campos:
   - id (UUID, PK)
   - name (CharField, único)
   - slug (SlugField, auto-generado, único)
   - description (TextField, opcional)
   - display_order (PositiveIntegerField)
   - is_active (BooleanField)
   - created_at, updated_at (auto)
4. Configurar admin.py con:
   - list_display, list_editable para orden
   - prepopulated_fields para slug
   - search_fields

## Criterio de Aceptación
- Slug se genera automáticamente desde el nombre
- Admin puede crear/editar categorías
- Categorías se ordenan por display_order

## Archivos a crear
- `backend/cms/` (nueva app)
- `backend/cms/models.py`
- `backend/cms/admin.py`
""",
        "priority": 2
    },
    {
        "title": "Implementar validador de archivos de audio",
        "description": """## Objetivo
Crear validador robusto para archivos de audio que valide extensión, tamaño y MIME type

## Tareas
1. Crear `backend/cms/validators.py`
2. Implementar función `validate_audio_file(file)` que:
   - Valide extensiones permitidas: .mp3, .wav, .flac
   - Valide tamaño máximo: 50MB
   - Valide MIME type real usando python-magic
   - Compare MIME detectado contra extensión declarada
3. Agregar python-magic a requirements.txt
4. Lanzar ValidationError descriptivo si falla

## Criterio de Aceptación
- Rechaza archivos con extensión no permitida
- Rechaza archivos mayores a 50MB
- Rechaza archivos con extensión falsa (ej: .exe renombrado a .mp3)
- Mensajes de error claros y descriptivos

## Archivos a crear/modificar
- `backend/cms/validators.py` (nuevo)
- `backend/requirements.txt`
""",
        "priority": 2
    },
    {
        "title": "Crear modelo PortfolioItem",
        "description": """## Objetivo
Crear modelo PortfolioItem para gestionar trabajos del portafolio

## Tareas
1. Crear enum ContentType con: FILE, YOUTUBE, SPOTIFY, SOUNDCLOUD
2. Crear modelo PortfolioItem con campos:
   - Información básica: title, client_name, description, category (FK)
   - Media: content_type, embed_url, audio_file (con validador), cover_image
   - Metadata: display_order, is_featured, is_active, release_date
3. Implementar método clean() para validación condicional:
   - Si content_type=FILE: audio_file requerido
   - Si content_type!=FILE: embed_url requerido
4. Configurar admin.py con filtros y búsqueda
5. Crear migraciones

## Criterio de Aceptación
- Validación condicional funciona correctamente
- Subida de archivos de audio funciona
- Subida de imágenes de portada funciona
- Admin muestra filtros por categoría y tipo

## Archivos a modificar
- `backend/cms/models.py`
- `backend/cms/admin.py`
""",
        "priority": 2
    },
    {
        "title": "Crear API endpoints para CMS",
        "description": """## Objetivo
Crear endpoints REST read-only para Categories y PortfolioItems

## Tareas
1. Crear `backend/cms/serializers.py`:
   - CategorySerializer
   - PortfolioItemSerializer (con categoría anidada y URLs absolutas)
2. Crear `backend/cms/views.py`:
   - CategoryViewSet (ReadOnlyModelViewSet)
   - PortfolioItemViewSet (con filtros)
3. Crear `backend/cms/urls.py` con router DRF
4. Registrar rutas en `config/urls.py`
5. Implementar filtros: category__slug, content_type, is_featured

## Endpoints a crear
- GET /api/cms/categories/
- GET /api/cms/portfolio/
- GET /api/cms/portfolio/?is_featured=true
- GET /api/cms/portfolio/?category__slug=mix

## Criterio de Aceptación
- Endpoints retornan solo registros activos
- PortfolioItem incluye categoría anidada (no solo ID)
- URLs de archivos son absolutas
- Filtros funcionan correctamente

## Archivos a crear
- `backend/cms/serializers.py`
- `backend/cms/views.py`
- `backend/cms/urls.py`
""",
        "priority": 3
    },
    {
        "title": "Pruebas y validación final",
        "description": """## Objetivo
Verificar que todo funciona correctamente antes de merge

## Tareas
1. Aplicar todas las migraciones
2. Probar en Django Admin:
   - Crear categoría y verificar slug auto-generado
   - Crear PortfolioItem con archivo de audio válido
   - Intentar subir archivo inválido y verificar rechazo
   - Editar orden de servicios
3. Probar endpoints API:
   - GET /api/cms/categories/ retorna datos
   - GET /api/cms/portfolio/ retorna items con categoría anidada
   - Filtros funcionan
4. Verificar que no hay errores en consola

## Criterio de Aceptación
- Todos los criterios de aceptación del PRD cumplidos
- No hay errores en migraciones
- Admin funciona sin errores
- API retorna datos correctos

## Definition of Done
Ver checklist completa en BET-38_shaping_solution.md
""",
        "priority": 3
    }
]

def create_issue(issue_data):
    """Crea un issue en Linear"""
    query = """
    mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
            success
            issue {
                id
                identifier
                url
                title
            }
        }
    }
    """

    variables = {
        "input": {
            "teamId": TEAM_ID,
            "title": issue_data["title"],
            "description": issue_data["description"],
            "stateId": BACKLOG_STATE,
            "parentId": PARENT_ID,
            "priority": issue_data.get("priority", 0)
        }
    }

    response = requests.post(
        URL,
        headers=HEADERS,
        json={"query": query, "variables": variables}
    )

    return response.json()

def main():
    created_issues = []

    print("Creando issues para BET-38 Roadmap...\n")

    for issue in ISSUES:
        result = create_issue(issue)

        if "errors" in result:
            print(f"ERROR creando '{issue['title']}':")
            print(json.dumps(result["errors"], indent=2))
        else:
            issue_data = result["data"]["issueCreate"]["issue"]
            created_issues.append(issue_data)
            print(f"[OK] {issue_data['identifier']}: {issue_data['title']}")
            print(f"  URL: {issue_data['url']}")

    print(f"\n{'='*50}")
    print(f"Total issues creados: {len(created_issues)}")

    # Guardar resultado
    with open(".issues/BET-38_created_issues.json", "w") as f:
        json.dump(created_issues, f, indent=2)

    return created_issues

if __name__ == "__main__":
    main()
