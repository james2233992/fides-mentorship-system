# FIDES Mentorship Management System

Sistema integral de gestión de mentorías para FIDES, desarrollado con tecnologías modernas y mejores prácticas.

## 🚀 Stack Tecnológico

### Backend
- **Framework**: NestJS con TypeScript
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Cache**: Redis
- **Autenticación**: JWT con Passport
- **Tiempo Real**: Socket.io
- **Colas**: BullMQ
- **API**: RESTful + WebSockets

### Frontend
- **Framework**: Next.js 14 con TypeScript
- **Estado**: Redux Toolkit
- **UI**: Tailwind CSS + shadcn/ui
- **Calendario**: FullCalendar
- **Formularios**: React Hook Form + Zod
- **Cliente WebSocket**: Socket.io-client

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- Docker y Docker Compose
- Git

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone [url-del-repositorio]
cd fides-mentorship-system
```

### 2. Configuración inicial
```bash
make setup
```

Este comando:
- Copia los archivos de configuración `.env`
- Instala las dependencias de backend y frontend
- Prepara el entorno de desarrollo

### 3. Configurar variables de entorno
Edita los archivos `.env` creados:
- `.env` (raíz del proyecto)
- `backend/.env`
- `frontend/.env.local`

### 4. Iniciar servicios con Docker
```bash
make dev
```

### 5. Ejecutar migraciones
```bash
make migrate
```

### 6. Sembrar datos de prueba
```bash
make seed
```

## 🔗 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 👥 Usuarios de Prueba (después del seed)

- **Admin**: admin@mentorship.com / admin123
- **Mentor**: john.mentor@mentorship.com / mentor123
- **Mentee**: alice.mentee@mentorship.com / mentee123

## 📁 Estructura del Proyecto

```
fides-mentorship-system/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Módulo de autenticación
│   │   ├── scheduling/     # Módulo de programación
│   │   ├── notifications/  # Módulo de notificaciones
│   │   └── users/          # Módulo de usuarios
│   └── prisma/             # Schema y migraciones
├── frontend/               # Aplicación Next.js
│   ├── app/               # App Router
│   ├── components/        # Componentes React
│   └── store/             # Redux store
├── docker/                # Configuraciones Docker
└── docker-compose.yml     # Orquestación de servicios
```

## 🔧 Comandos Útiles

### Desarrollo
```bash
make dev        # Iniciar todos los servicios
make stop       # Detener servicios
make logs       # Ver logs en tiempo real
make clean      # Limpiar todo (containers, volumes, images)
```

### Base de datos
```bash
make migrate    # Ejecutar migraciones
make seed       # Sembrar datos de prueba
make db         # Acceder a PostgreSQL
```

### Acceso a contenedores
```bash
make backend    # Shell del backend
make frontend   # Shell del frontend
```

### Testing
```bash
make test       # Ejecutar todos los tests
```

## 🔄 Flujo de Desarrollo

1. **Sprint 0**: Configuración inicial ✅
2. **Sprint 1**: Autenticación y usuarios
3. **Sprint 2**: Gestión de disponibilidad
4. **Sprint 3**: Motor de programación
5. **Sprint 4**: Sistema de notificaciones
6. **Sprint 5**: Panel de control
7. **Sprint 6**: Testing y optimización

## 🔐 Seguridad

- JWT tokens con refresh tokens
- Encriptación de contraseñas con bcrypt
- Rate limiting en APIs críticas
- CORS configurado
- Validación de datos con Zod
- Middleware de autorización por roles

## 📊 Características Principales

- ✅ Autenticación JWT multi-rol
- ✅ Gestión de usuarios (Admin, Mentor, Mentee)
- ✅ Programación automática de mentorías
- ✅ Notificaciones en tiempo real
- ✅ Sistema de disponibilidad para mentores
- ✅ Dashboard por rol
- ✅ Calendario interactivo
- ✅ Sistema de colas para tareas asíncronas

## 🐛 Solución de Problemas

### Error de conexión a base de datos
```bash
# Verificar que PostgreSQL esté ejecutándose
docker-compose ps
# Reiniciar servicios
make stop && make dev
```

### Error de permisos en Linux
```bash
# Cambiar propietario de los archivos
sudo chown -R $USER:$USER .
```

## 📝 Licencia

Este proyecto es privado y propiedad de FIDES.

## 🤝 Contribución

1. Crear una rama desde `develop`
2. Hacer commits descriptivos
3. Crear Pull Request hacia `develop`
4. Esperar revisión y aprobación

---

Desarrollado con ❤️ para FIDES