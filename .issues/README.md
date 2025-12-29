# Linear Issue Management

Este directorio contiene scripts y configuraciones para gestionar issues en Linear.

## Configuración

### 1. API Key
La API key de Linear debe estar configurada en el archivo `.env` raíz:

```env
LINEAR_API_KEY=lin_api_...
```

Para obtener tu API key:
1. Ve a https://linear.app/settings/api
2. Genera una nueva Personal API Key
3. Cópiala y agrégala al archivo `.env`

### 2. IDs del Workspace

**Team ID**: `fcbc0918-e222-4064-bf18-c8953761ac30`

**Parent Issues**:
- BET-5 (Roadmap general): `7e85d165-61c9-4536-85b6-5b81744a8944`
- BET-15 (Autenticación): `466801fc-a6a7-4b0d-8915-8341fd8f1a33`

## Scripts Disponibles

### 1. Script de Python para BET-15 (Recomendado)

Crea las 8 fases del roadmap de autenticación (BET-15):

```bash
cd .issues
python create_bet15_issues.py
```

**Usa el archivo**: `BET-15_roadmap_phases.json`

**Crea**:
- Fase 1: Setup y Configuración de Dependencias
- Fase 2: Modelos de Base de Datos y Migraciones
- Fase 3: Backend API - Endpoints de Autenticación
- Fase 4: Frontend - Formularios y Componentes UI
- Fase 5: Auth.js Configuration y Middleware
- Fase 6: Email Service - Password Reset
- Fase 7: Testing y Validación de Seguridad
- Fase 8: Documentación y Preparación para Deploy

### 2. Script de Python genérico

```bash
cd .issues
python create_issues.py
```

**Usa el archivo**: `create_roadmap_issues.json`

### 3. Script de Node.js

```bash
cd .issues
node create-linear-issues.js
```

**Usa el archivo**: `create_roadmap_issues.json`

## Archivos de Configuración

### JSON Files

- `BET-15_roadmap_phases.json` - Fases del sistema de autenticación
- `create_roadmap_issues.json` - Issues del roadmap general
- `bet15-created-issues.json` - Resultado de la última ejecución (BET-15)
- `created-issues.json` - Resultado de la última ejecución (general)

### Documentación

- `BET-15_shaping_solution.md` - Solución detallada para BET-15
- `BET-15-ROADMAP.md` - Roadmap de implementación BET-15
- `BET-16-SETUP-COMPLETE.md` - Documentación de setup completado
- `BET-17-DATABASE-MODELS-COMPLETE.md` - Modelos de BD completados
- `BET-5_shaping_solution.md` - Solución detallada para BET-5
- `BET-5-ROADMAP.md` - Roadmap general del proyecto

## Uso Típico

1. **Primera vez**: Crear todas las issues del roadmap BET-15:
   ```bash
   export LINEAR_API_KEY=lin_api_...  # o usa el .env
   cd .issues
   python create_bet15_issues.py
   ```

2. **Verificar resultados**: Revisa el archivo generado:
   ```bash
   cat bet15-created-issues.json
   ```

3. **Ver issues en Linear**: Los issues aparecerán como sub-issues de BET-15

## Notas de Seguridad

- ⚠️ NUNCA commitees el archivo `.env` con tu API key
- ⚠️ La API key actual está configurada en `.env` (gitignored)
- ⚠️ Si la API key se compromete, revócala inmediatamente en Linear

## Rate Limiting

Los scripts incluyen delays de 500ms entre requests para evitar rate limiting de la API de Linear.
