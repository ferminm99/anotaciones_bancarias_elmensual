# Usar una imagen de Node como base
FROM node:18-alpine

# Instalar supervisord y dockerize
RUN apk add --no-cache supervisor curl \
  && curl -L https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-alpine-linux-amd64-v0.6.1.tar.gz | tar -C /usr/local/bin -xzv

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos de dependencias del frontend y backend
COPY package.json package-lock.json ./ 
COPY ./backend/package.json ./backend/

# Instalar dependencias del frontend y backend
RUN npm install

# Copiar el código restante del frontend y backend
COPY . .

# Copiar la configuración de supervisord
COPY ./supervisord.conf /etc/supervisord.conf

# Exponer los puertos del frontend (3000) y backend (5000)
EXPOSE 3000 5000

# Ejecutar supervisord para manejar tanto el frontend como el backend
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
