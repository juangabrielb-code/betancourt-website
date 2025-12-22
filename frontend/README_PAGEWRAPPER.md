# PageWrapper Component

El componente `PageWrapper` envuelve todas las páginas de la aplicación y proporciona las siguientes características:

## Características

### 1. Fade Transition entre Rutas
Transiciones suaves de fade cuando se navega entre diferentes páginas. La transición tiene una duración de 300ms.

### 2. Scroll Progress Bar
Una barra de progreso minimalista en la parte superior de la pantalla que muestra el progreso del scroll. Utiliza un gradiente de colores (azul → púrpura → rosa).

### 3. Animaciones de Revelación (RevealSection)
El componente `RevealSection` permite agregar animaciones de revelación a cualquier sección cuando entra en el viewport. 

**Uso:**
```tsx
import { RevealSection } from "@/components/RevealSection";

<RevealSection delay={100}>
  <div>Tu contenido aquí</div>
</RevealSection>
```

**Props:**
- `children`: Contenido a animar
- `className`: Clases CSS adicionales (opcional)
- `delay`: Retraso en milisegundos para la animación (opcional, por defecto 0)

### 4. Cursor Follower
Un efecto sutil de cursor que sigue el movimiento del mouse. El cursor se amplía y cambia de apariencia cuando el usuario pasa sobre elementos con la clase `audio-track`.

**Uso:**
Para activar el efecto en un elemento, simplemente agrega la clase `audio-track`:

```tsx
<div className="audio-track">
  {/* Tu track de audio aquí */}
</div>
```

## Integración

El `PageWrapper` ya está integrado en `layout.tsx` y envuelve automáticamente todas las páginas de la aplicación.

## Componentes Exportados

Todos los componentes están disponibles desde `@/components`:

```tsx
import { 
  PageWrapper, 
  ScrollProgressBar, 
  CursorFollower, 
  RevealSection 
} from "@/components";
```

## Hooks Personalizados

### useScrollProgress
Hook que retorna el progreso del scroll (0-1).

### useViewportDetection
Hook que detecta cuando un elemento entra en el viewport usando Intersection Observer.

