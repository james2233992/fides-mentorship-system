#!/bin/bash

# Script para reemplazar todas las URLs localhost con variables de entorno

echo "Corrigiendo URLs hardcodeadas en el frontend..."

# Cambiar al directorio frontend
cd frontend

# Reemplazar localhost:3001 con la variable de entorno
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i.bak 's|http://localhost:3001|${process.env.NEXT_PUBLIC_API_URL}|g' {} \;
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i.bak 's|https://localhost:3001|${process.env.NEXT_PUBLIC_API_URL}|g' {} \;

# Para las URLs que no tienen http/https
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i.bak "s|'localhost:3001'|process.env.NEXT_PUBLIC_API_URL?.replace('https://', '').replace('http://', '')|g" {} \;

# Limpiar archivos de respaldo
find . -name "*.bak" -delete

echo "✅ URLs corregidas. Verificando cambios..."

# Mostrar archivos modificados
git status --short

echo "
⚠️  IMPORTANTE: 
1. Revisa los cambios con 'git diff'
2. Asegúrate de que las variables de entorno estén configuradas en Vercel:
   - NEXT_PUBLIC_API_URL=https://fides-mentorship-system-production.up.railway.app
   - NEXT_PUBLIC_WS_URL=wss://fides-mentorship-system-production.up.railway.app
"