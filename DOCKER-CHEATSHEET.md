# 🐳 Docker Cheat Sheet - Tributa

## 📌 Comandos que Usarás el 90% del Tiempo

```bash
# ⭐ Iniciar base de datos
docker-compose up -d postgres redis

# ⭐ Ver qué está corriendo
docker-compose ps

# ⭐ Ver logs
docker-compose logs -f

# ⭐ Detener todo
docker-compose down

# ⭐ Resetear base de datos (⚠️ borra datos)
docker-compose down -v && docker-compose up -d postgres redis
```

---

## 🎯 Por Escenario

### Primer Día / Setup Inicial
```bash
# 1. Asegúrate de que Docker Desktop esté corriendo
# 2. Navega al proyecto
cd F:\ME_A_DEVELOPER\betancourt-website

# 3. Inicia servicios
docker-compose up -d postgres redis

# 4. Verifica
docker-compose ps

# 5. Aplica migraciones
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py createsuperuser
```

### Desarrollo Normal
```bash
# Al iniciar el día
docker-compose up -d postgres redis

# Verificar estado
docker-compose ps

# Al terminar (opcional)
docker-compose down
```

### Cuando Algo Sale Mal
```bash
# Ver logs de error
docker-compose logs postgres

# Reiniciar un servicio
docker-compose restart postgres

# Empezar desde cero
docker-compose down -v
docker-compose up -d postgres redis
cd backend && python manage.py migrate
```

### Acceso a la Base de Datos
```bash
# Acceder a PostgreSQL
docker-compose exec postgres psql -U tributa_user -d tributa_db

# Ver tablas
\dt

# Ver datos de una tabla
SELECT * FROM core_customer;

# Salir
\q
```

### Mantenimiento
```bash
# Ver espacio usado
docker system df

# Limpiar (hacer 1 vez por semana)
docker system prune -f

# Ver recursos en tiempo real
docker stats
```

---

## 🔑 Comandos Esenciales Explicados

### `docker-compose up`
Inicia los servicios definidos en `docker-compose.yml`

```bash
docker-compose up              # Primer plano, ves los logs
docker-compose up -d           # Segundo plano (daemon)
docker-compose up postgres     # Solo un servicio
docker-compose up --build      # Reconstruye imágenes
```

### `docker-compose down`
Detiene y elimina contenedores

```bash
docker-compose down            # Detiene servicios
docker-compose down -v         # ⚠️ + borra volúmenes (datos)
docker-compose down --rmi all  # ⚠️ + borra imágenes
```

### `docker-compose logs`
Ver salida de los contenedores

```bash
docker-compose logs            # Todos los logs
docker-compose logs -f         # Seguir en tiempo real
docker-compose logs postgres   # Solo un servicio
docker-compose logs --tail=50  # Últimas 50 líneas
docker-compose logs --since 1h # Última hora
```

### `docker-compose exec`
Ejecutar comando dentro de un contenedor

```bash
docker-compose exec postgres psql -U tributa_user -d tributa_db
docker-compose exec postgres sh
docker-compose exec redis redis-cli
```

### `docker-compose ps`
Ver estado de los servicios

```bash
docker-compose ps              # Lista servicios
docker-compose ps -a           # Incluye detenidos
```

---

## 🎨 Colores en el Output

Cuando ejecutes `docker-compose ps`, verás:
- 🟢 **Up** = Corriendo correctamente
- 🔴 **Exit** = Detenido o con error
- 🟡 **Restarting** = Reiniciando (posible problema)

---

## 📊 Entender el docker-compose.yml

```yaml
services:
  postgres:                    # Nombre del servicio
    image: postgres:16-alpine  # Qué imagen usar
    container_name: tributa_postgres  # Nombre del contenedor
    environment:               # Variables de entorno
      POSTGRES_DB: tributa_db
    ports:                     # Puerto_host:Puerto_contenedor
      - "5432:5432"
    volumes:                   # Persistir datos
      - postgres_data:/var/lib/postgresql/data
    healthcheck:               # Verificar si está sano
      test: ["CMD-SHELL", "pg_isready"]
```

---

## 🚨 Errores Comunes y Soluciones

### Error: "port is already allocated"
```bash
# El puerto está siendo usado
# Solución 1: Detén el servicio local
brew services stop postgresql

# Solución 2: Cambia el puerto en docker-compose.yml
# De: "5432:5432"
# A:  "5433:5432"
# Y actualiza DB_PORT=5433 en backend/.env
```

### Error: "Cannot connect to database"
```bash
# Verifica que esté corriendo
docker-compose ps

# Ve los logs
docker-compose logs postgres

# Verifica las credenciales en backend/.env
cat backend/.env | grep DB_
```

### Error: "No space left on device"
```bash
# Docker usa mucho espacio
docker system df
docker system prune -a --volumes
```

### Warning: "Container is unhealthy"
```bash
# Ve qué pasa
docker-compose logs postgres

# Reinicia
docker-compose restart postgres

# Si no funciona, recrea
docker-compose down
docker-compose up -d postgres
```

---

## 💡 Tips Pro

### Alias útiles (agrega a ~/.zshrc o ~/.bashrc)
```bash
# Agregar al archivo de configuración
echo 'alias dcu="docker-compose up -d"' >> ~/.zshrc
echo 'alias dcd="docker-compose down"' >> ~/.zshrc
echo 'alias dcl="docker-compose logs -f"' >> ~/.zshrc
echo 'alias dcp="docker-compose ps"' >> ~/.zshrc
echo 'alias dcr="docker-compose restart"' >> ~/.zshrc

# Recargar configuración
source ~/.zshrc

# Ahora puedes usar:
dcu postgres redis  # en vez de docker-compose up -d postgres redis
dcl postgres        # en vez de docker-compose logs -f postgres
dcp                 # en vez de docker-compose ps
```

### Script de inicio rápido
```bash
# Crear archivo: ~/tributa-start.sh
#!/bin/bash
cd F:\ME_A_DEVELOPER\betancourt-website
docker-compose up -d postgres redis
echo "✅ Base de datos iniciada"
echo "📊 Estado de servicios:"
docker-compose ps

# Hacer ejecutable
chmod +x ~/betancour-start.sh

# Usar
~/betancour-start.sh
```

### Ver logs con colores y timestamps
```bash
docker-compose logs -f --timestamps postgres
```

### Backup automático de BD
```bash
# Crear script: ~/backup-tributa.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cd F:\ME_A_DEVELOPER\betancourt-website
docker-compose exec -T postgres pg_dump -U tributa_user tributa_db > "backups/backup_${DATE}.sql"
echo "✅ Backup creado: backup_${DATE}.sql"

# Usar
mkdir -p F:\ME_A_DEVELOPER\betancourt-website\backups
chmod +x ~/backup-tributa.sh
~/backup-tributa.sh
```

---

## 📚 Recursos para Aprender Más

### Videos en Español
- Busca: "Docker tutorial español" en YouTube
- Canal recomendado: "HolaMundo" y "Fazt"

### Documentación
- Oficial: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/

### Práctica
1. Juega con los comandos sin miedo
2. Usa `docker-compose down -v` para resetear
3. Lee los errores, Docker es muy descriptivo
4. Experimenta con otros servicios (nginx, mongodb, etc.)

---

## ✅ Checklist de Dominio

### Nivel Principiante (1-2 semanas)
- [ ] Puedo iniciar y detener servicios
- [ ] Entiendo qué es un contenedor
- [ ] Puedo ver logs cuando algo falla
- [ ] Sé resetear la base de datos

### Nivel Intermedio (1 mes)
- [ ] Entiendo el archivo docker-compose.yml
- [ ] Puedo acceder a la base de datos con psql
- [ ] Sé hacer backups y restaurar
- [ ] Puedo modificar puertos y variables

### Nivel Avanzado (2-3 meses)
- [ ] Puedo dockerizar el backend completo
- [ ] Entiendo volumes y networks
- [ ] Puedo crear mis propios Dockerfile
- [ ] Sé deployar a producción

---

## 🎯 Recomendación Final

**Para las primeras 2 semanas:**
Solo memoriza estos 3 comandos:

```bash
docker-compose up -d postgres redis    # Iniciar
docker-compose ps                      # Ver estado
docker-compose down                    # Detener
```

El resto lo aprenderás con la práctica cuando lo necesites.

¡Éxito! 🚀
