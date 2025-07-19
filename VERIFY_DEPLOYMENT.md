# Verificación del Deployment

## URLs de tu aplicación:

- **Frontend**: https://tu-app.vercel.app (reemplaza con tu URL real)
- **Backend**: https://fides-mentorship-system-production.up.railway.app

## Pruebas a realizar:

### 1. Verificar el Backend (Railway):
```bash
# Health check
curl https://fides-mentorship-system-production.up.railway.app/api/health

# Debería responder:
# {"status":"ok","timestamp":"...","uptime":...}
```

### 2. Verificar el Frontend (Vercel):
- Abre tu URL de Vercel en el navegador
- Abre las herramientas de desarrollo (F12)
- Ve a la pestaña Network
- Verifica que las llamadas API vayan a: `fides-mentorship-system-production.up.railway.app`

### 3. Probar el flujo completo:
1. Intenta registrarte
2. Intenta hacer login
3. Navega por la aplicación

## Si hay problemas:

### Error de CORS:
Verifica en Railway que tengas configurado:
```
FRONTEND_URL=https://tu-app.vercel.app
```

### Error de conexión:
- Revisa los logs en Railway
- Verifica que PostgreSQL esté conectado
- Revisa las variables de entorno

### Frontend no conecta:
- Verifica las variables en Vercel
- Asegúrate de que el redeploy se completó
- Limpia caché del navegador