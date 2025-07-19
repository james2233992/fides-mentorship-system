# 🚀 Configuración de Vercel - Paso a Paso

## Paso 1: Desconectar proyecto actual (si existe)

Si ya tienes un proyecto en Vercel:
1. Ve a https://vercel.com/dashboard
2. Encuentra tu proyecto `fides-mentorship-system` o similar
3. Click en el proyecto → Settings → Git
4. Click en "Disconnect" (si está conectado)

## Paso 2: Importar el proyecto

1. **Ve a**: https://vercel.com/new

2. **Click en** "Import Git Repository"

3. **Busca** `james2233992/fides-mentorship-system`
   - Si no aparece, click en "Add GitHub Account" y autoriza el acceso

4. **Click en** "Import" junto a tu repositorio

## Paso 3: Configurar el proyecto

### ⚠️ IMPORTANTE - Configuración correcta:

```
Project Name: fides-frontend (o el nombre que prefieras)
Framework Preset: Next.js (debería detectarlo automáticamente)
Root Directory: frontend ← ¡ESTE ES EL MÁS IMPORTANTE!
Build Command: npm run build (déjalo por defecto)
Output Directory: .next (déjalo por defecto)
Install Command: npm install (déjalo por defecto)
```

### Configurar Variables de Entorno:

Click en "Environment Variables" y agrega:

```
NEXT_PUBLIC_API_URL = https://fides-mentorship-system-production.up.railway.app
NEXT_PUBLIC_WS_URL = wss://fides-mentorship-system-production.up.railway.app
```

⚠️ **IMPORTANTE**: NO pongas comillas en los valores

## Paso 4: Deploy

1. **Click en** "Deploy"
2. **Espera** unos 2-5 minutos mientras Vercel construye tu aplicación
3. **Verás** los logs del build en tiempo real

## Paso 5: Verificar

Una vez completado el deploy:

1. **Vercel te dará una URL** como:
   - `https://fides-frontend.vercel.app`
   - o `https://fides-frontend-tuusuario.vercel.app`

2. **Abre la URL** en tu navegador

3. **Verifica que funcione**:
   - La página debe cargar correctamente
   - Intenta hacer login
   - Abre las herramientas de desarrollo (F12)
   - Ve a la pestaña Network
   - Las llamadas API deben ir a `fides-mentorship-system-production.up.railway.app`

## Paso 6: Configurar dominio personalizado (opcional)

Si tienes un dominio propio:
1. Ve a Settings → Domains
2. Agrega tu dominio
3. Sigue las instrucciones de DNS

## 🎉 ¡Listo!

A partir de ahora:
- Cada vez que hagas push a `main`, Vercel hará deploy automáticamente
- Los deploys tardan ~2-3 minutos
- Puedes ver el estado en https://vercel.com/dashboard

## Si algo sale mal:

### Error: "No framework detected"
- Asegúrate de que Root Directory sea `frontend`

### Error: "Build failed"
- Revisa que las variables de entorno estén configuradas
- Verifica que no haya comillas en los valores

### La página carga pero no conecta al backend
- Verifica las variables de entorno
- Asegúrate de que Railway esté funcionando
- Revisa la consola del navegador (F12)

## URLs de tu sistema completo:

- **Frontend**: https://tu-app.vercel.app (la URL que te dé Vercel)
- **Backend**: https://fides-mentorship-system-production.up.railway.app
- **Health Check Backend**: https://fides-mentorship-system-production.up.railway.app/api/health