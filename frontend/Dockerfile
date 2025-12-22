# Frontend Dockerfile para Next.js 14
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Exponer el puerto 3000
EXPOSE 3000

# Comando para modo desarrollo con hot-reloading
CMD ["npm", "run", "dev"]
