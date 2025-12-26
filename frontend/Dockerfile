# Dockerfile para Next.js 16 - Betancourt Audio
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache libc6-compat

# Copiar archivos de dependencias
COPY package*.json ./

# Limpiar cache de npm y instalar dependencias
RUN npm cache clean --force && \
    npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto 3000
EXPOSE 3000

# Comando para modo desarrollo con hot-reloading
CMD ["npm", "run", "dev"]
