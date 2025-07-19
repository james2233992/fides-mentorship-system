# 🚨 URGENTE: Configurar Variables de Entorno en Vercel

## El Problema
Tu frontend está tratando de acceder a `https://fides-mentorship-system-production.up.railway.app/auth/login` en lugar de `https://fides-mentorship-system-production.up.railway.app/api/auth/login`. Esto indica que la variable `NEXT_PUBLIC_API_URL` no está configurada correctamente en Vercel.

## Solución Inmediata

### Paso 1: Configurar las variables en Vercel

1. Ve a tu proyecto en [Vercel](https://vercel.com)
2. Click en tu proyecto `fides-mentorship-system-t8ey`
3. Ve a **Settings** → **Environment Variables**
4. Agrega o actualiza estas variables:

```
NEXT_PUBLIC_API_URL = https://fides-mentorship-system-production.up.railway.app/api
NEXT_PUBLIC_WS_URL = wss://fides-mentorship-system-production.up.railway.app
```

⚠️ **IMPORTANTE**: Asegúrate de que `NEXT_PUBLIC_API_URL` termine con `/api`

5. Selecciona que apliquen para **Production**, **Preview** y **Development**
6. Click en **Save**

### Paso 2: Redesplegar

Después de guardar las variables:
1. Ve a la pestaña **Deployments**
2. En el deployment más reciente, click en los tres puntos **...**
3. Selecciona **Redeploy**
4. Click en **Redeploy** en el modal

### Paso 3: Verificar

Una vez completado el redeploy (toma 1-2 minutos), verifica:
1. Abre las herramientas de desarrollo del navegador (F12)
2. Ve a la pestaña **Network**
3. Intenta hacer login
4. Deberías ver que las peticiones van a `/api/auth/login` no a `/auth/login`

## Variables de Entorno Necesarias en Vercel

```bash
# API Backend
NEXT_PUBLIC_API_URL=https://fides-mentorship-system-production.up.railway.app/api
NEXT_PUBLIC_WS_URL=wss://fides-mentorship-system-production.up.railway.app

# Opcional
NEXT_PUBLIC_APP_NAME=FIDES Mentorship
```

## Nota sobre `.env.production`

Aunque tienes un archivo `.env.production` con los valores correctos, Vercel NO usa automáticamente este archivo. Debes configurar las variables directamente en el dashboard de Vercel.

## Si el problema persiste

Si después de configurar las variables y redesplegar el problema continúa:
1. Limpia el caché del navegador
2. Intenta en una ventana de incógnito
3. Verifica en la consola del navegador qué URL está usando para las peticiones