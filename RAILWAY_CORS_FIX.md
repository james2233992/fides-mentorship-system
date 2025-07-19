# 🚨 URGENTE: Configuración CORS en Railway

## El Problema
Tu frontend en Vercel (`https://fides-mentorship-system-t8ey.vercel.app`) no puede conectarse al backend porque Railway está devolviendo un origen CORS diferente (`https://fides-frontend.vercel.app`).

## Solución Inmediata

### Paso 1: Configurar la variable CORS_ORIGIN en Railway

1. Ve a tu proyecto en [Railway](https://railway.app)
2. Click en tu servicio backend
3. Ve a la pestaña **"Variables"**
4. Busca si existe `CORS_ORIGIN` o `FRONTEND_URL`
5. Configúrala con:
   ```
   CORS_ORIGIN=https://fides-mentorship-system-t8ey.vercel.app
   ```

### Paso 2: Verificar la configuración

Una vez que Railway reinicie el servicio, verifica que la configuración esté correcta visitando:

```
https://fides-mentorship-system-production.up.railway.app/api/health
```

Deberías ver algo como:
```json
{
  "status": "ok",
  "cors": {
    "origin": "https://fides-mentorship-system-t8ey.vercel.app",
    "configured": "production"
  }
}
```

### Paso 3: Si necesitas múltiples orígenes

Si necesitas que funcione con múltiples frontends, configura:
```
CORS_ORIGIN=https://fides-mentorship-system-t8ey.vercel.app,https://fides-frontend.vercel.app
```

## Variables de Entorno Críticas

Asegúrate de tener estas variables configuradas en Railway:

- `CORS_ORIGIN`: La URL de tu frontend en Vercel
- `NODE_ENV`: production
- `JWT_SECRET`: Un string secreto seguro
- `DATABASE_URL`: (generada automáticamente por Railway si usas PostgreSQL)

## Debugging

Si después de configurar la variable el error persiste:

1. Verifica los logs en Railway para asegurarte de que el servicio se reinició
2. Revisa el endpoint de health: `/api/health`
3. Asegúrate de que no haya espacios extras en la URL de CORS_ORIGIN
4. Verifica que el frontend esté usando la URL correcta con `/api`

## Nota Importante

El backend ya está configurado para aceptar múltiples orígenes CORS. Solo necesitas configurar la variable de entorno correcta en Railway.