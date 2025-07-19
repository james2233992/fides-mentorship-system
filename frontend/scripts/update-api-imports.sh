#!/bin/bash

# Script to update all files to use centralized API configuration

echo "Updating files to use centralized API configuration..."

# Find all TypeScript/JavaScript files that use process.env.NEXT_PUBLIC_API_URL
files=$(grep -r "process\.env\.NEXT_PUBLIC_API_URL" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v "config/api.ts" | cut -d: -f1 | sort -u)

for file in $files; do
    echo "Processing: $file"
    
    # Check if the file already imports API_URL
    if ! grep -q "import.*API_URL.*from.*@/config/api" "$file"; then
        # Add import at the beginning of the file (after 'use client' if present)
        if grep -q "^'use client'" "$file"; then
            # File has 'use client', add import after it
            sed -i "/^'use client'/a\\\\nimport { API_URL } from '@/config/api'" "$file"
        else
            # Add import at the beginning
            sed -i "1i import { API_URL } from '@/config/api'\\n" "$file"
        fi
    fi
    
    # Replace process.env.NEXT_PUBLIC_API_URL with API_URL
    sed -i 's/process\.env\.NEXT_PUBLIC_API_URL/API_URL/g' "$file"
done

# Do the same for WS_URL
files=$(grep -r "process\.env\.NEXT_PUBLIC_WS_URL" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v "config/api.ts" | cut -d: -f1 | sort -u)

for file in $files; do
    echo "Processing WebSocket: $file"
    
    # Check if the file already imports WS_URL
    if ! grep -q "import.*WS_URL.*from.*@/config/api" "$file"; then
        # Check if it already imports API_URL
        if grep -q "import.*API_URL.*from.*@/config/api" "$file"; then
            # Update existing import
            sed -i "s/import { API_URL }/import { API_URL, WS_URL }/" "$file"
        else
            # Add new import
            if grep -q "^'use client'" "$file"; then
                sed -i "/^'use client'/a\\\\nimport { WS_URL } from '@/config/api'" "$file"
            else
                sed -i "1i import { WS_URL } from '@/config/api'\\n" "$file"
            fi
        fi
    fi
    
    # Replace process.env.NEXT_PUBLIC_WS_URL with WS_URL
    sed -i 's/process\.env\.NEXT_PUBLIC_WS_URL/WS_URL/g' "$file"
done

echo "Update complete!"