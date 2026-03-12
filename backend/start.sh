#!/bin/bash
# Script de inicio para Railway

# Mostrar variables de entorno para debugging
echo "Iniciando backend en Railway..."
echo "PORT: $PORT"
echo "DATABASE_URL: $DATABASE_URL"

# Usar el puerto asignado por Railway o 8000 por defecto
PORT=${PORT:-8000}
echo "Usando puerto: $PORT"

# Iniciar la aplicación
uvicorn app.main:app --host 0.0.0.0 --port $PORT