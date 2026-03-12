FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

# Dar permisos de ejecución al script
RUN chmod +x start.sh

# Usar el script como punto de entrada
CMD ["./start.sh"]