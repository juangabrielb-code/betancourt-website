# BET-38 Roadmap: Modelos de Datos para CMS

> **Issue Padre:** [BET-38](https://linear.app/betancourt-website/issue/BET-38/modelos-de-datos-para-cms-servicios-y-portafolio)
> **Rama:** `bet-38-modelos-de-datos-para-cms-servicios-y-portafolio`
> **Creado:** 2026-01-03

---

## Resumen Ejecutivo

Este roadmap desglosa la implementación de BET-38 en 6 sub-issues secuenciales que permiten construir el sistema CMS para gestión de servicios y portafolio.

---

## Issues Creados

| # | Issue | Título | Prioridad | Estado |
|---|-------|--------|-----------|--------|
| 1 | [BET-42](https://linear.app/betancourt-website/issue/BET-42/extender-modelo-service-con-display-order) | Extender modelo Service con display_order | P1 | Backlog |
| 2 | [BET-43](https://linear.app/betancourt-website/issue/BET-43/crear-app-cms-con-modelo-category) | Crear app CMS con modelo Category | P2 | Backlog |
| 3 | [BET-44](https://linear.app/betancourt-website/issue/BET-44/implementar-validador-de-archivos-de-audio) | Implementar validador de archivos de audio | P2 | Backlog |
| 4 | [BET-45](https://linear.app/betancourt-website/issue/BET-45/crear-modelo-portfolioitem) | Crear modelo PortfolioItem | P2 | Backlog |
| 5 | [BET-46](https://linear.app/betancourt-website/issue/BET-46/crear-api-endpoints-para-cms) | Crear API endpoints para CMS | P3 | Backlog |
| 6 | [BET-47](https://linear.app/betancourt-website/issue/BET-47/pruebas-y-validacion-final) | Pruebas y validacion final | P3 | Backlog |

---

## Grafo de Dependencias

```
BET-38 (Parent)
    |
    +-- BET-42: Service display_order
    |       |
    |       v
    +-- BET-43: App CMS + Category ----+
    |       |                          |
    |       v                          |
    +-- BET-44: Validador Audio -------+
    |                                  |
    |                                  v
    +-- BET-45: PortfolioItem (depende de Category + Validador)
    |       |
    |       v
    +-- BET-46: API Endpoints (depende de modelos)
            |
            v
    +-- BET-47: Pruebas (depende de todo)
```

### Orden de Ejecución Recomendado

1. **BET-42** - Puede ejecutarse de forma independiente
2. **BET-43** y **BET-44** - Pueden ejecutarse en paralelo
3. **BET-45** - Depende de BET-43 y BET-44
4. **BET-46** - Depende de BET-45
5. **BET-47** - Depende de todos los anteriores

---

## Fases de Implementación

### Fase 1: Extensión de Service (BET-42)
**Scope:** Backend - payments app
**Archivos:** `payments/models.py`, `payments/admin.py`
**Entregable:** Campo display_order funcionando en admin

### Fase 2: Infraestructura CMS (BET-43, BET-44)
**Scope:** Backend - nueva app cms
**Archivos:**
- `cms/__init__.py`, `cms/apps.py`
- `cms/models.py` (Category)
- `cms/admin.py`
- `cms/validators.py`
- `requirements.txt`

**Entregable:** App CMS con Category y validador de audio listos

### Fase 3: Modelo de Contenido (BET-45)
**Scope:** Backend - cms app
**Archivos:** `cms/models.py` (PortfolioItem)
**Entregable:** PortfolioItem con validación condicional y subida de archivos

### Fase 4: API (BET-46)
**Scope:** Backend - cms app
**Archivos:**
- `cms/serializers.py`
- `cms/views.py`
- `cms/urls.py`
- `config/urls.py`

**Entregable:** Endpoints REST funcionando con filtros

### Fase 5: Validación (BET-47)
**Scope:** Full stack
**Entregable:** Sistema completo validado contra criterios de aceptación

---

## Criterios de Éxito

Del PRD original ([BET-38_shaping_solution.md](./BET-38_shaping_solution.md)):

- [ ] Admin puede crear/editar/eliminar servicios sin tocar código
- [ ] Admin puede gestionar el portafolio completo desde `/admin`
- [ ] Frontend puede consumir datos dinámicos via API
- [ ] Tiempo de actualización de contenido: < 2 minutos

---

## Dependencias Técnicas

| Dependencia | Versión | Estado |
|-------------|---------|--------|
| Django REST Framework | >=3.14 | Instalado |
| Pillow | >=10.0 | Verificar |
| python-magic | >=0.4.27 | **Agregar** |

---

## Próximos Pasos

1. Mover **BET-42** a "Todo" para iniciar implementación
2. Crear rama de trabajo: `bet-38-modelos-de-datos-para-cms-servicios-y-portafolio`
3. Seguir el orden de dependencias para cada issue
4. Marcar cada issue como "Done" al completar sus criterios de aceptación
5. Al completar BET-47, marcar BET-38 como "Done"

---

## Documentación Relacionada

- **PRD Completo:** [BET-38_shaping_solution.md](./BET-38_shaping_solution.md)
- **Issues JSON:** [BET-38_created_issues.json](./BET-38_created_issues.json)

---

*Roadmap generado automáticamente | 2026-01-03*
