# 🚀 Cómo Forzar un Redeploy en Vercel

## Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. Ve a [vercel.com](https://vercel.com) y entra a tu cuenta
2. Busca tu proyecto: `fides-mentorship-system-t8ey`
3. Ve a la pestaña **Deployments**
4. En el deployment más reciente, haz click en los tres puntos **⋮**
5. Selecciona **Redeploy**
6. En el modal que aparece:
   - Asegúrate de que esté seleccionado **Use existing Build Cache: NO**
   - Click en **Redeploy**

## Opción 2: Trigger desde GitHub

1. Ve a tu repositorio en GitHub
2. Haz un cambio menor (como agregar un espacio en un archivo)
3. Commit y push:
   ```bash
   git add .
   git commit -m "Force Vercel redeploy"
   git push
   ```

## Opción 3: Usando Vercel CLI

Si tienes Vercel CLI instalado:
```bash
vercel --prod --force
```

## Verificar el Redeploy

1. En Vercel, ve a **Deployments**
2. Deberías ver un nuevo deployment en progreso
3. Espera 1-2 minutos a que complete
4. Una vez completado, verifica que funcione el login

## Si el Problema Persiste

Si después del redeploy sigues teniendo problemas:

1. **Limpia el caché del navegador**: Ctrl+Shift+R (o Cmd+Shift+R en Mac)
2. **Prueba en incógnito**: Para asegurarte de que no hay caché
3. **Verifica las Network Tools**: 
   - Abre F12 → Network
   - Intenta hacer login
   - La petición debería ir a `/api/auth/login` no a `/auth/login`

## Nota sobre el Backend

Hemos agregado un middleware temporal en el backend que redirige las rutas sin `/api` a las rutas correctas. Esto significa que funcionará incluso si Vercel no se actualiza inmediatamente.