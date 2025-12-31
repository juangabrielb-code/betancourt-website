# BET-32 Dashboard Shell - Implementation Roadmap

**Parent Issue**: [BET-32: PRD Híbrido - Dashboard Shell y Onboarding Operativo](https://linear.app/betancourt-website/issue/BET-32)
**Status**: In Progress
**Branch**: `feat/BET-32-dashboard-shell`

---

## Overview

This roadmap breaks down the BET-32 dashboard implementation into 5 sequential phases, each with clear deliverables and acceptance criteria.

### Timeline Estimate
- **Total Duration**: 3-5 days
- **Phase 1-2**: 1-2 days (Core structure & widgets)
- **Phase 3-4**: 1 day (Integration & types)
- **Phase 5**: 0.5-1 day (Polish & testing)

---

## Phases & Linear Issues

### ✅ Phase 0: Planning & Architecture
**Status**: Completed
- [x] Solution plan created (.issues/BET-32_shaping_solution.md)
- [x] Key decisions documented
- [x] Technical approach approved

---

### 🔄 Phase 1: Core Structure & Layout
**Issue**: [BET-33: Fase 1 - Dashboard Core Structure & Layout](https://linear.app/betancourt-website/issue/BET-33/fase-1-dashboard-core-structure-and-layout)
**Status**: In Progress
**Priority**: High

**Deliverables**:
- `frontend/src/app/dashboard/layout.tsx` - Dashboard wrapper layout
- `frontend/src/components/dashboard/Sidebar.tsx` - Desktop sidebar (7 nav items)
- `frontend/src/components/dashboard/BottomNav.tsx` - Mobile bottom nav (5 primary actions)
- `frontend/src/components/dashboard/MobileHeader.tsx` - Mobile header with theme toggle

**Acceptance Criteria**:
- [ ] Sidebar visible en desktop con 7 opciones de navegación
- [ ] Bottom nav visible en mobile (<768px)
- [ ] Active state highlighting funciona
- [ ] User profile section en sidebar top
- [ ] Logout button funcional

**Dependencies**: None

---

### 📦 Phase 2: Dashboard Widgets & Cards
**Issue**: [BET-34: Fase 2 - Dashboard Widgets & Cards](https://linear.app/betancourt-website/issue/BET-34/fase-2-dashboard-widgets-and-cards)
**Status**: Backlog
**Priority**: High

**Deliverables**:
- `frontend/src/components/dashboard/WalletCard.tsx` - Balance display (COP/USD)
- `frontend/src/components/dashboard/ActiveProjectsWidget.tsx` - Projects list con progress bars
- `frontend/src/components/dashboard/PendingTasksWidget.tsx` - Tasks list con badges
- `frontend/src/components/dashboard/QuickActionsCard.tsx` - CTA buttons

**Acceptance Criteria**:
- [ ] WalletCard muestra $0 COP placeholder
- [ ] ActiveProjectsWidget muestra empty state cuando no hay proyectos
- [ ] Progress bars funcionan correctamente
- [ ] QuickActionsCard tiene CTA prominente con warm-glow styling
- [ ] Todos los widgets usan GlassCard para glass morphism

**Dependencies**: Phase 1 (needs layout structure)

---

### 🔗 Phase 3: Integration
**Issue**: [BET-35: Fase 3 - Integrar Widgets en Dashboard Page](https://linear.app/betancourt-website/issue/BET-35/fase-3-integrar-widgets-en-dashboard-page)
**Status**: Backlog
**Priority**: Medium

**Deliverables**:
- Updated `frontend/src/app/dashboard/page.tsx` with all widgets integrated

**Changes**:
- Remover las tarjetas básicas actuales
- Añadir saludo personalizado: "Hola, {name} 🎧"
- Integrar WalletCard, ActiveProjectsWidget, QuickActionsCard, PendingTasksWidget
- Layout: 2 columnas en desktop, stack vertical en mobile

**Acceptance Criteria**:
- [ ] Saludo personalizado muestra nombre del usuario
- [ ] Todos los widgets se integran correctamente
- [ ] Layout responsive funciona (2 cols desktop, 1 col mobile)
- [ ] Empty state visible cuando no hay proyectos

**Dependencies**: Phase 1 & 2

---

### 📝 Phase 4: TypeScript Types & Interfaces
**Issue**: [BET-36: Fase 4 - TypeScript Types & Interfaces](https://linear.app/betancourt-website/issue/BET-36/fase-4-typescript-types-and-interfaces)
**Status**: Backlog
**Priority**: Medium

**Deliverables**:
- `frontend/src/types/dashboard.ts` - All dashboard interfaces and types

**Interfaces to Define**:
- `DashboardStats` - userName, walletBalance, activeProjectsCount, pendingTasks
- `Project` - id, name, status, progress, createdAt
- `NavItem` - id, label, icon, href, badge

**Acceptance Criteria**:
- [ ] Todas las interfaces definidas según especificación
- [ ] TypeScript types exportados correctamente
- [ ] Sin errores de tipo en componentes

**Dependencies**: Can be done in parallel with Phase 1-3

---

### 🎨 Phase 5: Responsive Styles & Polish
**Issue**: [BET-37: Fase 5 - Responsive Styles & Polish](https://linear.app/betancourt-website/issue/BET-37/fase-5-responsive-styles-and-polish)
**Status**: Backlog
**Priority**: Medium

**Deliverables**:
- Updated `frontend/tailwind.config.ts` with dashboard utilities
- Updated `frontend/src/app/globals.css` with dashboard CSS variables

**Tasks**:
- Añadir variables CSS para sidebar width, bottom nav height, z-index layering
- Verificar breakpoints responsive
- Asegurar transiciones suaves dark/light mode
- Pulir efectos glass morphism

**Acceptance Criteria**:
- [ ] Sidebar width variables definidas
- [ ] Bottom nav height variables definidas
- [ ] Z-index layering correcto
- [ ] Transiciones suaves entre temas
- [ ] Glass morphism effects consistentes
- [ ] Responsive breakpoints funcionan correctamente

**Dependencies**: Phase 1, 2, 3

---

## Dependencies Graph

```
Phase 0 (Planning) ✅
    ↓
Phase 1 (Structure) 🔄 ← Phase 4 (Types) can run in parallel
    ↓
Phase 2 (Widgets)
    ↓
Phase 3 (Integration)
    ↓
Phase 5 (Polish)
```

---

## Success Criteria (from BET-32)

1. ✅ **Redirección Automática**: Al terminar el login, el sistema redirige a `/dashboard`
2. ✅ **Personalización**: El dashboard muestra el nombre y la foto de perfil (OAuth)
3. ✅ **Empty State**: Si no hay proyectos, aparece botón "Empieza tu primer proyecto aquí"
4. ✅ **Responsive**: Layout legible en smartphones

---

## Testing Checklist

- [x] Desktop: Sidebar visible y responsive
- [x] Mobile (<768px): Bottom nav visible, sidebar oculto
- [x] Theme toggle funciona en dashboard
- [x] Empty state se muestra cuando no hay proyectos
- [x] Wallet muestra $0 COP placeholder
- [x] Todas las 7 opciones de navegación presentes
- [x] Nombre de usuario se muestra en saludo
- [x] Botón de logout funciona
- [x] Transiciones suaves entre light/dark mode
- [x] Efectos glass morphism se renderizan correctamente

## Final Testing Results (BET-37)

**Date**: 2025-12-31

### ✅ Responsive Design
- Desktop (>= 768px): Sidebar fixed left, always visible ✓
- Mobile (< 768px): Bottom nav fixed, mobile header visible ✓
- Tablet: Proper spacing and grid layouts ✓
- All widgets stack vertically on mobile ✓

### ✅ Dark/Light Mode
- All components support both themes ✓
- Smooth transitions with CSS variables ✓
- Glass morphism effects work in both modes ✓
- No FOUC (Flash of Unstyled Content) ✓

### ✅ TypeScript
- Zero TypeScript errors in dashboard components ✓
- All types properly defined and exported ✓
- Mock data type-safe ✓

### ✅ Navigation
- All 7 sidebar nav items present and linked ✓
- Active state highlighting works ✓
- Bottom nav shows 5 primary actions ✓
- Mobile header with profile dropdown functional ✓
- Logout button works ✓

### ✅ Widgets
- WalletCard: $0 COP placeholder, proper formatting ✓
- ActiveProjectsWidget: Empty state with CTA shown ✓
- PendingTasksWidget: Empty state shown ✓
- QuickActionsCard: Primary CTA prominent with warm-glow ✓
- All widgets use GlassCard component ✓

### ✅ Animations
- Framer Motion animations smooth ✓
- Progress bars animate correctly ✓
- Hover states responsive ✓
- Page transitions smooth ✓

---

## All Created Issues

| ID | Title | Status | URL |
|----|-------|--------|-----|
| BET-32 | PRD Híbrido: Dashboard Shell y Onboarding Operativo | ✅ Done | [View](https://linear.app/betancourt-website/issue/BET-32) |
| BET-33 | Fase 1: Dashboard Core Structure & Layout | ✅ Done | [View](https://linear.app/betancourt-website/issue/BET-33/fase-1-dashboard-core-structure-and-layout) |
| BET-34 | Fase 2: Dashboard Widgets & Cards | ✅ Done | [View](https://linear.app/betancourt-website/issue/BET-34/fase-2-dashboard-widgets-and-cards) |
| BET-35 | Fase 3: Integrar Widgets en Dashboard Page | ✅ Done | [View](https://linear.app/betancourt-website/issue/BET-35/fase-3-integrar-widgets-en-dashboard-page) |
| BET-36 | Fase 4: TypeScript Types & Interfaces | ✅ Done | [View](https://linear.app/betancourt-website/issue/BET-36/fase-4-typescript-types-and-interfaces) |
| BET-37 | Fase 5: Responsive Styles & Polish | ✅ Done | [View](https://linear.app/betancourt-website/issue/BET-37/fase-5-responsive-styles-and-polish) |

---

## Next Steps

1. **Immediate**: Start Phase 1 (BET-33) - Core structure & layout
2. Complete Sidebar and BottomNav components
3. Move to Phase 2 once navigation is functional
4. TypeScript types (Phase 4) can be created in parallel
5. Final polish and testing in Phase 5

---

## Notes

- All phases use mock data ($0 COP, 0 projects)
- Backend integration deferred to future issues (BET-38+)
- Japandi aesthetic with glass morphism maintained throughout
- Dark mode as default ("Studio Dark Mode")
- Mobile-first responsive approach
