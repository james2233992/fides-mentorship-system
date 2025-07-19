# Variables de Entorno para Railway

## Variables Requeridas

Configura estas variables en tu proyecto de Railway:

### Base de Datos (PostgreSQL)
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

### Autenticación
```
JWT_SECRET=tu-secret-muy-seguro-aqui
JWT_EXPIRES_IN=7d
```

### URLs
```
# Opción 1: Un solo origen
CORS_ORIGIN=https://fides-mentorship-system-t8ey.vercel.app

# Opción 2: Múltiples orígenes (separados por comas)
CORS_ORIGIN=https://fides-mentorship-system-t8ey.vercel.app,https://fides-frontend.vercel.app

# URL del backend (se genera automáticamente en Railway)
BACKEND_URL=https://tu-app.railway.app
```

### Email (Opcional - SendGrid)
```
SENDGRID_API_KEY=tu-api-key-aqui
EMAIL_FROM=noreply@tudominio.com
```

### Redis (Si lo usas)
```
REDIS_URL=redis://default:password@host:port
```

### Otros
```
NODE_ENV=production
PORT=3000
```

## Cómo configurarlas en Railway:

1. Ve a tu proyecto en Railway
2. Click en tu servicio backend
3. Ve a la pestaña "Variables"
4. Agrega cada variable con su valor correspondiente
5. Railway reiniciará automáticamente el servicio

## Nota importante:

Si agregaste PostgreSQL y Redis como servicios en Railway, las variables `DATABASE_URL` y `REDIS_URL` deberían estar disponibles automáticamente.