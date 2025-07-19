#!/bin/bash

# FIDES Mentorship System - Script de Despliegue
# Este script automatiza el proceso de despliegue

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funciones de utilidad
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar argumentos
if [ "$#" -ne 1 ]; then
    echo "Uso: $0 [development|staging|production]"
    exit 1
fi

ENVIRONMENT=$1

# Verificar que Docker está instalado
if ! command -v docker &> /dev/null; then
    log_error "Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose no está instalado"
    exit 1
fi

# Función para desplegar
deploy() {
    local env=$1
    log_info "Iniciando despliegue en $env..."

    # Pull últimos cambios
    log_info "Obteniendo últimos cambios..."
    git pull origin $(git branch --show-current)

    # Verificar archivo de entorno
    if [ ! -f ".env" ]; then
        log_warning "Archivo .env no encontrado, copiando de .env.example"
        cp .env.example .env
        log_warning "Por favor, configura las variables de entorno en .env"
        exit 1
    fi

    # Seleccionar archivo docker-compose
    case $env in
        development)
            COMPOSE_FILE="docker-compose.dev.yml"
            ;;
        staging|production)
            COMPOSE_FILE="docker-compose.yml"
            ;;
    esac

    # Detener servicios existentes
    log_info "Deteniendo servicios existentes..."
    docker-compose -f $COMPOSE_FILE down

    # Construir imágenes
    log_info "Construyendo imágenes Docker..."
    docker-compose -f $COMPOSE_FILE build --no-cache

    # Iniciar servicios
    log_info "Iniciando servicios..."
    docker-compose -f $COMPOSE_FILE up -d

    # Esperar a que los servicios estén listos
    log_info "Esperando a que los servicios estén listos..."
    sleep 10

    # Verificar estado de servicios
    log_info "Verificando estado de servicios..."
    docker-compose -f $COMPOSE_FILE ps

    # Ejecutar migraciones
    log_info "Ejecutando migraciones de base de datos..."
    docker-compose -f $COMPOSE_FILE exec -T backend npx prisma migrate deploy

    # Verificar salud de servicios
    log_info "Verificando salud de servicios..."
    
    # Backend health check
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        log_info "Backend está funcionando correctamente"
    else
        log_error "Backend no responde"
        exit 1
    fi

    # Frontend health check
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "Frontend está funcionando correctamente"
    else
        log_error "Frontend no responde"
        exit 1
    fi

    log_info "¡Despliegue completado exitosamente!"
    log_info "Frontend: http://localhost:3000"
    log_info "Backend API: http://localhost:3001/api"
}

# Función para backup
backup() {
    log_info "Creando backup de la base de datos..."
    
    BACKUP_DIR="./backups"
    mkdir -p $BACKUP_DIR
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.db"
    
    # Copiar archivo SQLite
    docker-compose exec -T backend cp /app/prisma/dev.db /tmp/backup.db
    docker cp $(docker-compose ps -q backend):/tmp/backup.db $BACKUP_FILE
    
    log_info "Backup creado: $BACKUP_FILE"
}

# Función para rollback
rollback() {
    log_info "Iniciando rollback..."
    
    # Obtener commit anterior
    PREVIOUS_COMMIT=$(git rev-parse HEAD~1)
    
    log_info "Volviendo al commit: $PREVIOUS_COMMIT"
    git checkout $PREVIOUS_COMMIT
    
    # Redesplegar
    deploy $ENVIRONMENT
}

# Menú principal
case $ENVIRONMENT in
    development|staging|production)
        # Crear backup antes de desplegar
        backup
        
        # Desplegar
        deploy $ENVIRONMENT
        
        # Mostrar logs
        log_info "Mostrando logs (Ctrl+C para salir)..."
        docker-compose -f $COMPOSE_FILE logs -f
        ;;
    *)
        log_error "Ambiente no válido: $ENVIRONMENT"
        echo "Ambientes válidos: development, staging, production"
        exit 1
        ;;
esac