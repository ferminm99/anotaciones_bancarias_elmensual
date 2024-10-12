# Usar una imagen de Node como base
FROM node:18-alpine AS builder

# Instalar supervisord
RUN apk add --no-cache supervisor

# Establecer el directorio de trabajo en el contenedor (para el frontend)
WORKDIR /app

# Copiar solo los archivos de dependencias del frontend (package.json y package-lock.json)
COPY ./package.json ./package-lock.json ./

# Instalar dependencias del frontend
RUN npm install --production

# Copiar el código restante del frontend
COPY ./ ./

# Cambiar al directorio del backend
WORKDIR /app/backend

# Copiar solo los archivos de dependencias del backend (package.json y package-lock.json)
COPY ./backend/package.json ./backend/package-lock.json ./

# Instalar dependencias del backend
RUN npm install --production

# Volver al directorio principal (para ejecutar supervisord y manejar ambos procesos)
WORKDIR /app

# Copiar la configuración de supervisord
COPY ./supervisord.conf /etc/supervisord.conf

# Exponer los puertos del frontend (3000) y backend (5000)
EXPOSE 3000 5000

# Limpiar la caché de npm
RUN npm cache clean --force

# Ejecutar supervisord para manejar ambos procesos (frontend y backend)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
