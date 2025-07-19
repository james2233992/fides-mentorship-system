# Guía de Deployment en Vercel

## 🚨 Problema Identificado

El deployment automático en Vercel mediante GitHub Actions no se está ejecutando correctamente.

## Opciones para Solucionarlo:

### Opción 1: Verificar GitHub Actions (Recomendado primero)

1. **Ve a tu repositorio en GitHub**:
   - https://github.com/james2233992/fides-mentorship-system
   - Click en la pestaña "Actions"
   - Busca el workflow "Deploy Frontend to Vercel"

2. **Verifica si el workflow se ejecutó**:
   - Si no aparece, el problema son los secrets faltantes
   - Si aparece pero falló, revisa los logs

3. **Configura los Secrets necesarios**:
   Ve a Settings → Secrets and variables → Actions → New repository secret

   ```
   VERCEL_TOKEN = (obténlo desde Vercel)
   VERCEL_ORG_ID = (obténlo desde Vercel) 
   VERCEL_PROJECT_ID = (obténlo desde Vercel)
   ```

   Para obtener estos valores:
   - Ve a https://vercel.com/account/tokens
   - Crea un nuevo token
   - Para ORG_ID y PROJECT_ID, ejecuta en tu terminal local:
   ```bash
   cd frontend
   npx vercel link
   cat .vercel/project.json
   ```

### Opción 2: Configurar Deploy Automático de Vercel (Más fácil)

1. **Desconecta el proyecto actual** (si existe):
   - Ve a tu proyecto en Vercel
   - Settings → Git → Disconnect

2. **Importa el proyecto nuevamente**:
   - New Project → Import Git Repository
   - Selecciona: `james2233992/fides-mentorship-system`
   - **IMPORTANTE**: Configura:
     - Root Directory: `frontend`
     - Framework Preset: Next.js
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Configura las variables de entorno**:
   ```
   NEXT_PUBLIC_API_URL=https://fides-mentorship-system-production.up.railway.app
   NEXT_PUBLIC_WS_URL=wss://fides-mentorship-system-production.up.railway.app
   ```

4. **Deploy**:
   - Vercel hará deploy automáticamente con cada push a `main`

### Opción 3: Deploy Manual Inmediato

Si necesitas hacer deploy AHORA:

```bash
# En tu terminal local
cd frontend
npx vercel --prod

# Cuando te pregunte:
# - Set up and deploy: Y
# - Which scope: (selecciona tu cuenta)
# - Link to existing project?: Y (si ya existe) o N (para crear nuevo)
# - Project name: fides-frontend
# - Root directory: ./
# - Override settings?: N
```

## Verificación Post-Deploy

1. **Verifica que la aplicación funcione**:
   - Abre tu URL de Vercel
   - Intenta hacer login
   - Revisa la consola del navegador (F12)

2. **Verifica las llamadas API**:
   - En Network tab, las llamadas deben ir a:
   - `https://fides-mentorship-system-production.up.railway.app`

## Estado Actual del Sistema

- ✅ **Backend (Railway)**: Funcionando en https://fides-mentorship-system-production.up.railway.app
- ✅ **Código Frontend**: Actualizado con variables de entorno
- ❌ **Frontend (Vercel)**: Esperando configuración de deploy
- ⏳ **GitHub Actions**: Necesita secrets configurados

## Recomendación

Para simplicidad, recomiendo la **Opción 2** (Deploy Automático de Vercel) ya que:
- No requiere configurar secrets en GitHub
- Se actualiza automáticamente con cada push
- Es más fácil de mantener
- Vercel maneja todo el proceso