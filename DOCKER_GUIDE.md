# 📘 Guía de Flujo de Trabajo con Docker para Betancourt

Esta guía está diseñada para que te olvides de la complejidad de los servidores y te concentres en **diseñar y desarrollar**. Piensa en Docker como una "caja mágica" donde vive tu aplicación, asegurando que siempre funcione igual, sin importar qué computadora uses.

---

## ☀️ 1. Tu Rutina Diaria (El Flujo Básico)

### Al empezar el día:
En lugar de abrir 3 terminales y correr comandos complicados, solo abre una terminal en la carpeta del proyecto y escribe:

```bash
make dev
```

**¿Qué hace esto?**
- Enciende el Backend (Django) y el Frontend (Next.js).
- Enciende la Base de Datos y Redis.
- Conecta todo entre sí automáticamente.
- **Lo más importante**: Activa el "Hot Reload". Si cambias un color en el CSS o una línea en Python, ¡se actualiza solo!

### Al terminar el día:
Cuando quieras apagar todo:

```bash
make down
```

---

## 🎮 2. El "Control Remoto" (Makefile)

El archivo `Makefile` es como un control remoto con botones simples para tareas complejas. Aquí están los botones que usarás:

| Comando | ¿Qué hace? | ¿Cuándo usarlo? |
| :--- | :--- | :--- |
| `make dev` | **INICIAR TODO** en modo desarrollo. | Cada vez que vas a trabajar. |
| `make down` | **APAGAR TODO** y liberar memoria. | Cuando terminas de trabajar. |
| `make logs` | **VER QUÉ PASA**. Muestra los mensajes de error o actividad. | Si algo no funciona o quieres ver "prints". |
| `make build` | **RECONSTRUIR**. Actualiza la "caja mágica". | Si agregaste una librería nueva al Backend. |
| `make clean` | **REINICIO DE FÁBRICA**. Borra todo (incluida la Base de Datos). | Si quieres empezar desde cero absoluto (¡Cuidado!). |

---

## 📦 3. ¿Cómo instalo cosas? (La Regla de Oro)

Aquí es donde muchos se confunden. La regla es simple: **Los archivos de configuración mandan.**

### 🎨 Frontend (Instalar librerías de diseño, iconos, etc.)
Como tienes Node.js instalado en tu Mac, puedes hacerlo de la forma tradicional. Docker lo detectará automáticamente.

1. **Instala en tu terminal normal**:
   ```bash
   cd frontend
   npm install framer-motion  # Ejemplo
   ```
2. **¡Listo!** Docker verá los cambios en `package.json` y `node_modules` automáticamente gracias a los "volúmenes" (puentes entre tu Mac y Docker).

### ⚙️ Backend (Instalar librerías de Python)
Aquí es un poco diferente porque Python es más estricto.

1. **Edita el archivo**: Abre `backend/requirements.txt`.
2. **Agrega el nombre**: Escribe el nombre de la librería al final (ej. `pandas`).
3. **Dile a Docker que actualice**:
   ```bash
   make build
   make dev
   ```
   *Esto reconstruye la "caja" con la nueva herramienta adentro.*

---

## 🤖 4. Cómo usar a tu Agente de AI

Tienes un copiloto potente. No necesitas memorizar todo esto. Aquí hay cosas que puedes pedirle directamente a tu agente (yo):

**Para instalar cosas:**
> "Necesito instalar la librería `stripe` en el backend. Haz los cambios necesarios y dime qué comandos correr."

**Para errores:**
> "Me salió un error en la terminal que dice 'Connection refused'. Revisa los logs de docker y arréglalo."

**Para bases de datos:**
> "Necesito reiniciar la base de datos con datos de prueba. ¿Puedes hacerlo por mí?"

**Para entender algo:**
> "Explícame qué está haciendo el contenedor de 'redis' en este momento."

---

## ❓ Preguntas Frecuentes

**P: ¿Por qué usar Docker y no correrlo normal en mi Mac?**
R: Docker garantiza que si funciona en tu máquina, funcionará en el servidor real. Evita el famoso "¡Pero en mi compu sí funcionaba!". Además, mantiene tu Mac limpia de configuraciones de bases de datos y versiones de Python.

**P: ¿Qué cosas NO debo instalar en Docker?**
R: Herramientas de tu editor (VS Code extensions), navegadores, herramientas de diseño. Docker es solo para **el código que hace funcionar la aplicación**.

**P: Todo va lento, ¿qué hago?**
R: Ejecuta `make down` y luego `make dev` de nuevo. A veces las computadoras necesitan un reinicio rápido.
