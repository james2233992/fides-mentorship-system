# FIDES Mentorship System - Guía de Despliegue

## Requisitos Previos

- Docker 20.10+ y Docker Compose 2.0+
- Node.js 20+ (para desarrollo local)
- Git
- Cuenta en GitHub (para CI/CD)
- Servidor con Ubuntu 20.04+ (para producción)

## Desarrollo Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/fides-mentorship-system.git
cd fides-mentorship-system
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus valores
```

### 3. Ejecutar con Docker Compose (Desarrollo)
```bash
# Construir e iniciar servicios
docker-compose -f docker-compose.dev.yml up --build

# O en segundo plano
docker-compose -f docker-compose.dev.yml up -d --build
```

### 4. Acceder a la aplicación
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Redis Commander (opcional): http://localhost:8081

## Despliegue en Producción

### 1. Preparar el servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configurar el firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Clonar y configurar el proyecto

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/fides-mentorship-system.git
cd fides-mentorship-system

# Crear archivo de entorno
cp .env.example .env
nano .env  # Configurar valores de producción
```

### 4. Desplegar con Docker Compose

```bash
# Construir e iniciar servicios
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Verificar estado
docker-compose ps
```

### 5. Configurar Nginx (opcional)

Si usas el perfil de producción con Nginx:

```bash
# Crear directorio para configuración
mkdir -p nginx/ssl

# Crear archivo de configuración
nano nginx/nginx.conf
```

Ejemplo de configuración nginx.conf:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:3001;
    }

    server {
        listen 80;
        server_name tu-dominio.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name tu-dominio.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /socket.io {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 6. SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem nginx/ssl/key.pem

# Ejecutar con perfil de producción
docker-compose --profile production up -d
```

## Comandos Útiles

### Docker Compose

```bash
# Ver logs
docker-compose logs -f [servicio]

# Reiniciar servicio
docker-compose restart [servicio]

# Ejecutar comandos en contenedor
docker-compose exec backend npm run migration:run

# Actualizar
git pull
docker-compose down
docker-compose up -d --build
```

### Backup de Base de Datos

```bash
# Crear backup
docker-compose exec backend npm run backup

# Restaurar backup
docker-compose exec backend npm run restore backup-file.sql
```

### Monitoreo

```bash
# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f --tail=100

# Verificar salud de servicios
docker-compose ps
```

## CI/CD con GitHub Actions

El proyecto incluye un pipeline de CI/CD que:

1. Ejecuta tests en cada push
2. Construye imágenes Docker
3. Las publica en GitHub Container Registry
4. Despliega automáticamente a staging (rama develop)
5. Despliega a producción (rama main)

### Configurar GitHub Actions

1. Configurar secretos en GitHub:
   - `STAGING_HOST`: IP del servidor de staging
   - `STAGING_USER`: Usuario SSH
   - `STAGING_KEY`: Clave SSH privada
   - `PRODUCTION_HOST`: IP del servidor de producción
   - `PRODUCTION_USER`: Usuario SSH
   - `PRODUCTION_KEY`: Clave SSH privada

2. Los despliegues se activan automáticamente al hacer push a:
   - `develop` → Staging
   - `main` → Producción

## Solución de Problemas

### El contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs backend

# Verificar permisos
sudo chown -R 1001:1001 backend/uploads backend/logs
```

### Error de conexión a Redis

```bash
# Verificar que Redis está ejecutándose
docker-compose ps redis

# Reiniciar Redis
docker-compose restart redis
```

### Base de datos corrupta

```bash
# Recrear base de datos
docker-compose exec backend npx prisma migrate reset
```

## Seguridad

1. **Cambiar secretos**: Modificar todos los valores por defecto en `.env`
2. **Actualizar regularmente**: Mantener Docker y dependencias actualizadas
3. **Backups**: Configurar backups automáticos diarios
4. **Monitoreo**: Implementar alertas para errores y caídas
5. **HTTPS**: Siempre usar SSL en producción

## Escalabilidad

Para escalar la aplicación:

```bash
# Escalar el backend
docker-compose up -d --scale backend=3

# Configurar load balancer en Nginx
```

## Soporte

Para problemas o preguntas:
- Crear issue en GitHub
- Contactar al equipo de desarrollo
- Revisar logs con `docker-compose logs`