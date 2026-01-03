# BET-39 Roadmap: Panel de Administración Dinámico (SaaS Style)

> **Issue Padre:** [BET-39](https://linear.app/betancourt-website/issue/BET-39/panel-de-administracion-dinamico-saas-style)
> **Rama:** `bet-39-panel-de-administracion-dinamico-saas-style`
> **Dependencia:** BET-38 (debe completarse primero)
> **Creado:** 2026-01-03

---

## Resumen Ejecutivo

Este roadmap implementa un panel de administración SaaS-style que permite gestionar servicios y portfolio sin tocar código. Usa Shadcn/UI para la interfaz, Django API para el backend, y Supabase Storage para archivos.

---

## Issues Creados

| # | Issue | Título | Prioridad | Estado |
|---|-------|--------|-----------|--------|
| 1 | [BET-48](https://linear.app/betancourt-website/issue/BET-48/instalar-y-configurar-shadcnui) | Instalar y configurar Shadcn/UI | P1 | Backlog |
| 2 | [BET-49](https://linear.app/betancourt-website/issue/BET-49/crear-layout-de-admin-con-shadcn) | Crear layout de Admin con Shadcn | P1 | Backlog |
| 3 | [BET-50](https://linear.app/betancourt-website/issue/BET-50/implementar-crud-de-servicios) | Implementar CRUD de Servicios | P2 | Backlog |
| 4 | [BET-51](https://linear.app/betancourt-website/issue/BET-51/implementar-detector-de-media-youtube-spotify-soundcloud) | Implementar detector de media | P2 | Backlog |
| 5 | [BET-52](https://linear.app/betancourt-website/issue/BET-52/configurar-supabase-storage) | Configurar Supabase Storage | P2 | Backlog |
| 6 | [BET-53](https://linear.app/betancourt-website/issue/BET-53/implementar-crud-de-portfolio) | Implementar CRUD de Portfolio | P2 | Backlog |
| 7 | [BET-54](https://linear.app/betancourt-website/issue/BET-54/implementar-configuracion-global-cms) | Implementar configuración global CMS | P3 | Backlog |
| 8 | [BET-55](https://linear.app/betancourt-website/issue/BET-55/implementar-revalidacion-instantanea) | Implementar revalidación instantánea | P3 | Backlog |
| 9 | [BET-56](https://linear.app/betancourt-website/issue/BET-56/pruebas-y-validacion-final-bet-39) | Pruebas y validación final | P3 | Backlog |

---

## Grafo de Dependencias

```
BET-38 (Backend API) ──────────────────────────────────────┐
                                                           │
BET-39 (Parent)                                            │
    │                                                      │
    +── BET-48: Shadcn/UI ─────┐                          │
    │                          │                          │
    +── BET-49: Layout Admin ──┼── (dependen de Shadcn)   │
                               │                          │
                               v                          v
    +── BET-50: CRUD Servicios ──────────────────── (depende de API)
    │
    +── BET-51: Detector Media ────┐
    │                              │
    +── BET-52: Supabase Storage ──┼── (paralelo)
    │                              │
    +── BET-53: CRUD Portfolio ────┴── (depende de 51 + 52)
    │
    +── BET-54: Config Global CMS ─────── (depende de API)
    │
    +── BET-55: Revalidación ─────────── (depende de CRUD)
            │
            v
    +── BET-56: Pruebas ──────────────── (depende de todo)
```

### Orden de Ejecución Recomendado

**Prerequisito:** Completar BET-38 (Backend + API)

**Fase 1 (Fundación):**
1. BET-48 - Instalar Shadcn/UI
2. BET-49 - Layout de Admin

**Fase 2 (Core Features - Paralelo):**
3. BET-50 - CRUD Servicios
4. BET-51 - Detector de Media
5. BET-52 - Supabase Storage

**Fase 3 (Integración):**
6. BET-53 - CRUD Portfolio (depende de 51 + 52)

**Fase 4 (Configuración):**
7. BET-54 - Config Global CMS
8. BET-55 - Revalidación

**Fase 5 (Validación):**
9. BET-56 - Pruebas finales

---

## Fases de Implementación

### Fase 1: Fundación UI
**Scope:** Frontend - Next.js
**Issues:** BET-48, BET-49
**Entregables:**
- Shadcn/UI instalado y configurado
- Layout de admin con sidebar navegable
- Protección de rutas ADMIN

### Fase 2: Core Features
**Scope:** Frontend + Integraciones
**Issues:** BET-50, BET-51, BET-52
**Entregables:**
- CRUD completo de servicios
- Detector de media con preview
- Integración Supabase Storage

### Fase 3: Portfolio
**Scope:** Frontend
**Issues:** BET-53
**Entregables:**
- CRUD de portfolio con embeds
- Subida de archivos a Supabase
- Filtros por categoría/tipo

### Fase 4: Configuración
**Scope:** Frontend + Backend
**Issues:** BET-54, BET-55
**Entregables:**
- Switches de mantenimiento y precios
- Revalidación instantánea de cache

### Fase 5: Validación
**Scope:** Full stack
**Issues:** BET-56
**Entregables:**
- Sistema completo probado
- Definition of Done cumplida

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Shadcn/UI | latest | Componentes UI |
| react-hook-form | ^7.x | Manejo de forms |
| zod | ^3.x | Validación |
| @supabase/supabase-js | ^2.x | Storage |
| Next.js | 16.x | Framework |
| Django REST | 3.14+ | API Backend |

---

## Criterios de Éxito

Del PRD original:

- [ ] Cero hardcode de datos en frontend
- [ ] Admin puede gestionar servicios sin código
- [ ] Admin puede gestionar portfolio sin código
- [ ] Detección automática de media funciona
- [ ] Archivos se suben a Supabase
- [ ] Config global funciona (mantenimiento + precios)
- [ ] Cambios se reflejan instantáneamente
- [ ] Solo ADMIN puede acceder

---

## Dependencias Críticas

### BET-38 → BET-39
```
BET-38 provee:
├── Modelo Service con display_order
├── Modelo Category
├── Modelo PortfolioItem
├── Validador de audio
└── API endpoints read-only

BET-39 agrega:
├── Endpoints write (POST/PUT/DELETE)
├── Modelo SiteConfig
├── Panel admin en Next.js
└── Integración Supabase
```

---

## Próximos Pasos

1. **Prerequisito:** Completar BET-38 primero
2. Mover **BET-48** a "Todo" para iniciar
3. Crear proyecto en Supabase (tier gratuito)
4. Seguir orden de dependencias

---

## Documentación Relacionada

- **PRD Completo:** [BET-39_shaping_solution.md](./BET-39_shaping_solution.md)
- **Dependencia:** [BET-38-ROADMAP.md](./BET-38-ROADMAP.md)

---

*Roadmap generado automáticamente | 2026-01-03*
