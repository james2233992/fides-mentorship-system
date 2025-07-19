#!/usr/bin/env python3
import os
import re

# Lista de archivos a corregir
files_to_fix = [
    './app/admin/notifications/page.tsx',
    './app/admin/page.tsx',
    './app/admin/sessions/new/page.tsx',
    './app/admin/sessions/page.tsx',
    './app/admin/users/new/page.tsx',
    './app/admin/users/page.tsx',
    './app/messages/page.tsx',
    './app/admin/users/[id]/edit/page.tsx'
]

# Patrón para encontrar strings mal formateados
pattern = r"'(\$\{process\.env\.NEXT_PUBLIC_API_URL\}[^']*)'(?![^`]*`)"

def fix_file(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Reemplazar comillas simples por backticks
        fixed_content = re.sub(pattern, r'`\1`', content)
        
        if content != fixed_content:
            with open(filepath, 'w') as f:
                f.write(fixed_content)
            print(f"✅ Corregido: {filepath}")
        else:
            print(f"✓ Sin cambios: {filepath}")
    except Exception as e:
        print(f"❌ Error en {filepath}: {e}")

# Cambiar al directorio frontend
os.chdir('frontend')

# Procesar cada archivo
for file in files_to_fix:
    if os.path.exists(file):
        fix_file(file)

print("\n✨ Proceso completado!")