#!/usr/bin/env python3
"""
Script para crear issues de roadmap en Linear para BET-39
"""
import requests
import json
import os

API_KEY = os.environ.get("LINEAR_API_KEY", "")
TEAM_ID = "fcbc0918-e222-4064-bf18-c8953761ac30"
PARENT_ID = "a442168e-835f-4243-aff6-1ddf82a841c5"  # BET-39
BACKLOG_STATE = "27e367fb-437c-458d-9d2e-6c48f85d2fe2"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": API_KEY
}

URL = "https://api.linear.app/graphql"

# Sub-issues a crear
ISSUES = [
    {
        "title": "Instalar y configurar Shadcn/UI",
        "description": """## Objetivo
Instalar Shadcn/UI en el proyecto Next.js para usar componentes profesionales en el admin panel.

## Tareas
1. Ejecutar `npx shadcn@latest init` en /frontend
2. Seleccionar estilo "New York", color base "Slate"
3. Configurar tailwind.config.ts para compatibilidad con CSS existente
4. Instalar componentes: button, input, form, table, dialog, select, switch, tabs, card, badge, skeleton, toast, alert-dialog
5. Verificar que el build funciona sin conflictos con UI custom

## Criterio de Aceptacion
- Componentes Shadcn disponibles en /admin
- UI custom existente sigue funcionando en paginas publicas
- Build de Next.js completa sin errores

## Dependencias
- react-hook-form
- zod
- @radix-ui/*
""",
        "priority": 1
    },
    {
        "title": "Crear layout de Admin con Shadcn",
        "description": """## Objetivo
Disenar e implementar el layout base del panel de administracion.

## Tareas
1. Crear src/app/admin/layout.tsx con estructura sidebar + header
2. Implementar sidebar navegable con secciones: Dashboard, Servicios, Portfolio, Configuracion
3. Agregar header con info del usuario admin y boton logout
4. Hacer sidebar responsive (colapsable en mobile)
5. Verificar que la proteccion de rol ADMIN funciona en middleware

## Criterio de Aceptacion
- Layout con sidebar y header funcionando
- Navegacion entre secciones sin errores
- Responsive en mobile (sidebar colapsable)
- Solo usuarios ADMIN pueden acceder

## Archivos a crear/modificar
- src/app/admin/layout.tsx
- src/components/admin/Sidebar.tsx
- src/components/admin/Header.tsx
""",
        "priority": 1
    },
    {
        "title": "Implementar CRUD de Servicios",
        "description": """## Objetivo
Crear interfaz completa para gestionar servicios (crear, editar, eliminar, reordenar).

## Tareas
1. Crear pagina src/app/admin/services/page.tsx con tabla de servicios
2. Crear componente ServiceForm con react-hook-form + zod
3. Implementar hooks: useServices, useCreateService, useUpdateService, useDeleteService
4. Agregar funcionalidad de reordenamiento (input numerico o drag-drop)
5. Implementar confirmacion antes de eliminar (AlertDialog)
6. Agregar toasts de exito/error

## Criterio de Aceptacion
- Tabla muestra todos los servicios con nombre, precios, orden, estado
- Formulario valida: nombre requerido, precios > 0
- Al guardar, el servicio aparece en la tabla inmediatamente
- Cambios se reflejan en frontend publico (revalidacion)

## Endpoints Django requeridos
- GET/POST /api/payments/services/
- PUT/DELETE /api/payments/services/{id}/
""",
        "priority": 2
    },
    {
        "title": "Implementar detector de media (YouTube/Spotify/SoundCloud)",
        "description": """## Objetivo
Crear sistema que detecte automaticamente el tipo de media desde una URL y genere el embed correcto.

## Tareas
1. Crear src/lib/media-detector.ts con funcion detectMediaProvider(url)
2. Implementar regex para detectar:
   - YouTube: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
   - Spotify: open.spotify.com/track/, album/, playlist/
   - SoundCloud: soundcloud.com/{user}/{track}
3. Crear componente MediaPreview que renderiza el embed
4. Retornar: provider, embedUrl, embedHtml
5. Validar: rechazar URLs no soportadas con mensaje claro

## Criterio de Aceptacion
- Al pegar URL de YouTube, detecta y muestra preview
- Al pegar URL de Spotify, detecta y muestra preview
- Al pegar URL de SoundCloud, detecta y muestra preview
- URLs no soportadas muestran mensaje de error

## Archivos a crear
- src/lib/media-detector.ts
- src/components/admin/MediaPreview.tsx
""",
        "priority": 2
    },
    {
        "title": "Configurar Supabase Storage",
        "description": """## Objetivo
Integrar Supabase Storage para subida de imagenes y audio del portfolio.

## Tareas
1. Crear proyecto en Supabase (tier gratuito)
2. Crear bucket "portfolio-media" con politica publica de lectura
3. Agregar variables de entorno en .env.local
4. Crear src/lib/supabase.ts con cliente configurado
5. Crear funciones uploadCoverImage(file) y uploadAudioFile(file)
6. Implementar validacion de tamano (50MB max para audio)
7. Retornar URL publica para guardar en Django

## Criterio de Aceptacion
- Subida de imagenes funciona y retorna URL publica
- Subida de audio funciona con limite de 50MB
- Archivos accesibles publicamente por URL
- Errores de subida muestran mensaje claro

## Variables de entorno
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Archivos a crear
- src/lib/supabase.ts
- src/lib/storage.ts
""",
        "priority": 2
    },
    {
        "title": "Implementar CRUD de Portfolio",
        "description": """## Objetivo
Crear interfaz completa para gestionar items del portfolio con soporte de media embebido y archivos.

## Tareas
1. Crear pagina src/app/admin/portfolio/page.tsx con tabla filtrable
2. Crear componente PortfolioForm con campos dinamicos segun tipo
3. Integrar MediaPreview para URLs de embed
4. Integrar upload de imagen (portada) y audio (si tipo=FILE)
5. Agregar selector de categoria
6. Implementar filtros por categoria y tipo de contenido
7. Agregar confirmacion antes de eliminar

## Criterio de Aceptacion
- Tabla muestra items con titulo, artista, categoria, tipo, estado
- Filtros por categoria y tipo funcionan
- Al seleccionar tipo embed, muestra preview antes de guardar
- Al seleccionar tipo FILE, permite subir audio
- Imagen de portada se sube a Supabase

## Endpoints Django requeridos
- GET/POST /api/cms/portfolio/
- PUT/DELETE /api/cms/portfolio/{id}/
- GET /api/cms/categories/
""",
        "priority": 2
    },
    {
        "title": "Implementar configuracion global CMS",
        "description": """## Objetivo
Crear sistema de configuracion global con switches para modo mantenimiento y ocultar precios.

## Tareas
1. Crear modelo SiteConfig en Django con campos:
   - maintenance_mode (boolean)
   - hide_prices (boolean)
   - updated_at, updated_by
2. Crear endpoints GET/PUT /api/cms/config/
3. Crear pagina src/app/admin/settings/page.tsx con switches
4. Crear hook useSiteConfig para leer/actualizar
5. En frontend publico, leer config y aplicar:
   - Si maintenance_mode: mostrar pagina de mantenimiento
   - Si hide_prices: ocultar precios en servicios

## Criterio de Aceptacion
- Switch de mantenimiento activa/desactiva pagina de mantenimiento
- Switch de precios oculta/muestra precios en frontend
- Cambios se aplican inmediatamente (revalidacion)
- Solo admin puede cambiar configuracion

## Archivos a crear
- backend/cms/models.py (agregar SiteConfig)
- src/app/admin/settings/page.tsx
- src/hooks/useSiteConfig.ts
""",
        "priority": 3
    },
    {
        "title": "Implementar revalidacion instantanea",
        "description": """## Objetivo
Configurar revalidacion de cache para que cambios en admin se reflejen inmediatamente en frontend publico.

## Tareas
1. Identificar paginas que usan datos de servicios/portfolio
2. Agregar revalidatePath o revalidateTag en acciones de guardado
3. Configurar tags de cache para invalidacion granular
4. Probar que cambios se reflejan inmediatamente
5. Documentar estrategia de cache

## Criterio de Aceptacion
- Al guardar servicio, frontend publico muestra cambio sin esperar
- Al guardar portfolio item, frontend publico muestra cambio sin esperar
- Al cambiar config, frontend publico aplica cambio sin esperar
- Sin necesidad de rebuild o deploy

## Archivos a modificar
- Acciones de guardado en admin
- Paginas publicas con fetch de datos
""",
        "priority": 3
    },
    {
        "title": "Pruebas y validacion final BET-39",
        "description": """## Objetivo
Verificar que todo el admin panel funciona correctamente antes de merge.

## Tareas
1. Probar CRUD completo de servicios
2. Probar CRUD completo de portfolio
3. Probar deteccion de media con URLs reales
4. Probar subida de archivos a Supabase
5. Probar configuracion global
6. Probar revalidacion instantanea
7. Probar en mobile (responsive)
8. Verificar seguridad de roles

## Criterio de Aceptacion
Todos los criterios de aceptacion del PRD cumplidos:
- [ ] Shadcn/UI instalado sin conflictos
- [ ] Layout admin con sidebar navegable
- [ ] CRUD servicios funcionando
- [ ] CRUD portfolio funcionando
- [ ] Deteccion de media con preview
- [ ] Subida a Supabase funcionando
- [ ] Config global funcionando
- [ ] Revalidacion instantanea
- [ ] Solo ADMIN puede acceder
- [ ] Responsive en mobile

## Definition of Done
Ver checklist completa en BET-39_shaping_solution.md
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

    print("Creando issues para BET-39 Roadmap...\n")

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
    with open(".issues/BET-39_created_issues.json", "w") as f:
        json.dump(created_issues, f, indent=2)

    return created_issues

if __name__ == "__main__":
    main()
