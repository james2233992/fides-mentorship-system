#!/bin/bash

# FIDES Mentorship System - Script de Monitoreo
# Este script monitorea el estado de los servicios

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
BACKEND_URL="http://localhost:3001/api/health"
FRONTEND_URL="http://localhost:3000"
REDIS_CONTAINER="fides-redis"

# Funciones de utilidad
check_service() {
    local name=$1
    local url=$2
    
    if curl -f -s $url > /dev/null; then
        echo -e "${GREEN}✓${NC} $name está funcionando"
        return 0
    else
        echo -e "${RED}✗${NC} $name no responde"
        return 1
    fi
}

check_container() {
    local name=$1
    local container=$2
    
    if docker ps | grep -q $container; then
        echo -e "${GREEN}✓${NC} $name está ejecutándose"
        return 0
    else
        echo -e "${RED}✗${NC} $name no está ejecutándose"
        return 1
    fi
}

# Header
echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}FIDES Mentorship System - Monitor${NC}"
echo -e "${BLUE}==================================${NC}"
echo ""

# Fecha y hora
echo -e "${YELLOW}Fecha:${NC} $(date)"
echo ""

# Estado de servicios
echo -e "${YELLOW}Estado de Servicios:${NC}"
check_service "Backend API" $BACKEND_URL
check_service "Frontend" $FRONTEND_URL
check_container "Redis" $REDIS_CONTAINER
echo ""

# Uso de recursos
echo -e "${YELLOW}Uso de Recursos:${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | grep -E "(CONTAINER|fides-)"
echo ""

# Espacio en disco
echo -e "${YELLOW}Espacio en Disco:${NC}"
df -h | grep -E "(Filesystem|/$)"
echo ""

# Logs recientes con errores
echo -e "${YELLOW}Errores Recientes (últimas 24h):${NC}"
docker-compose logs --since 24h 2>&1 | grep -i "error" | tail -5 || echo "No se encontraron errores"
echo ""

# Conexiones activas
echo -e "${YELLOW}Conexiones Activas:${NC}"
netstat -an | grep -E "(3000|3001)" | grep ESTABLISHED | wc -l | xargs echo "Total de conexiones:"
echo ""

# Base de datos
echo -e "${YELLOW}Estado de Base de Datos:${NC}"
if docker-compose exec -T backend npx prisma db pull 2>&1 | grep -q "success"; then
    echo -e "${GREEN}✓${NC} Base de datos accesible"
else
    echo -e "${RED}✗${NC} Problema con la base de datos"
fi
echo ""

# Uptime
echo -e "${YELLOW}Tiempo de Actividad:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep fides-
echo ""

# Resumen
echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}Resumen:${NC}"

ERRORS=0
check_service "Backend API" $BACKEND_URL > /dev/null 2>&1 || ((ERRORS++))
check_service "Frontend" $FRONTEND_URL > /dev/null 2>&1 || ((ERRORS++))
check_container "Redis" $REDIS_CONTAINER > /dev/null 2>&1 || ((ERRORS++))

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Todos los servicios funcionando correctamente${NC}"
else
    echo -e "${RED}✗ Se detectaron $ERRORS servicios con problemas${NC}"
fi
echo -e "${BLUE}==================================${NC}"