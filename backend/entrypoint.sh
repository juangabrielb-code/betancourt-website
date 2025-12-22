#!/bin/bash
set -e

echo "Esperando a que PostgreSQL esté disponible..."

until pg_isready -h db -p 5432 -U postgres; do
  echo "PostgreSQL no está listo - esperando..."
  sleep 1
done

echo "PostgreSQL está listo!"

# Ejecutar migraciones
echo "Ejecutando migraciones..."
python manage.py migrate --noinput || true

# Recolectar archivos estáticos
echo "Recolectando archivos estáticos..."
python manage.py collectstatic --noinput --clear || true

echo "Iniciando servidor Django..."

exec "$@"
