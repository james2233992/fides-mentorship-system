# Sistema de Notificaciones - FIDES Mentorship System

## Descripción General

El sistema de notificaciones ha sido completamente implementado con soporte para múltiples canales:
- **Email**: A través de SendGrid, SMTP o Ethereal (desarrollo)
- **SMS**: A través de Twilio
- **WebSocket**: Notificaciones en tiempo real
- **Persistencia**: Todas las notificaciones se guardan en la base de datos

## Configuración

### Variables de Entorno

Copie el archivo `.env.example` y configure las siguientes variables:

```bash
# Email Configuration
# Opción 1: SendGrid (Recomendado para producción)
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxx"

# Opción 2: SMTP (Gmail, Outlook, etc.)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-contraseña-de-aplicación"

# Opción 3: Ethereal (Solo desarrollo - crea cuenta temporal)
# Se auto-configura si no hay otras opciones

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_PHONE_NUMBER="+1234567890"

# General
EMAIL_FROM="FIDES <noreply@fides.edu>"
```

## Tipos de Notificaciones

### 1. MENTORSHIP_SCHEDULED
- Se envía cuando se programa una nueva mentoría
- Canales: Email, WebSocket
- Destinatarios: Mentor y Mentee

### 2. MENTORSHIP_REMINDER
- Se envía 24 horas antes de la mentoría
- Canales: Email, SMS, WebSocket
- Destinatarios: Mentor y Mentee

### 3. MENTORSHIP_CANCELLED
- Se envía cuando se cancela una mentoría
- Canales: Email, SMS, WebSocket
- Destinatarios: Mentor y Mentee

### 4. SESSION_STARTING
- Se envía 15 minutos antes del inicio
- Canales: WebSocket
- Destinatarios: Mentor y Mentee

### 5. WEEKLY_SUMMARY
- Se envía los lunes a las 9 AM
- Canales: Email
- Destinatarios: Mentores con sesiones programadas

## Arquitectura

### Procesamiento de Colas

Las notificaciones se procesan de forma asíncrona usando BullMQ:

```typescript
// Agregar notificación a la cola
await notificationQueue.addNotification({
  userId: 'user-id',
  type: 'MENTORSHIP_SCHEDULED',
  title: 'Nueva Mentoría',
  message: 'Se ha programado una nueva mentoría',
  metadata: {
    notificationChannels: ['email', 'sms', 'websocket'],
    // ... datos adicionales
  }
});
```

### Procesadores de Tareas Programadas

- **Recordatorios diarios**: Se ejecuta cada hora para buscar sesiones del día siguiente
- **Alertas de inicio**: Se ejecuta cada 10 minutos para sesiones que empiezan pronto
- **Resumen semanal**: Se ejecuta los lunes a las 9 AM

## Uso en el Frontend

### WebSocket Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/notifications');

// Unirse a la sala del usuario
socket.emit('join-room', { userId: currentUser.id });

// Escuchar notificaciones
socket.on('notification', (data) => {
  console.log('Nueva notificación:', data);
  // Mostrar toast, actualizar UI, etc.
});
```

### API REST

```javascript
// Obtener notificaciones del usuario
GET /api/notifications

// Marcar notificación como leída
PATCH /api/notifications/:id/read

// Eliminar notificación
DELETE /api/notifications/:id
```

## Templates de Email

Los emails incluyen:
- Diseño responsive HTML
- Versión en texto plano
- Enlaces de acción cuando aplica
- Footer con información de contacto

### Personalización

Los templates se pueden personalizar en:
- `src/notifications/services/email.service.ts`

## Seguridad

- Los números de teléfono se formatean automáticamente
- Los emails se validan antes de enviar
- Las credenciales se manejan via variables de entorno
- Los errores no exponen información sensible

## Monitoreo

Los logs incluyen:
- Estado de envío de cada notificación
- Errores detallados para debugging
- Métricas de procesamiento de colas

## Testing

### Email en Desarrollo

Si no configura credenciales de email, el sistema usa Ethereal automáticamente y muestra un link de preview en los logs.

### SMS en Desarrollo

Si no configura Twilio, los SMS se loguean en consola en lugar de enviarse.

## Troubleshooting

### Emails no se envían
1. Verificar credenciales en `.env`
2. Para Gmail, usar contraseña de aplicación
3. Revisar logs del servicio de email

### SMS no se envían
1. Verificar credenciales de Twilio
2. Asegurar que el número tiene formato internacional
3. Verificar saldo en cuenta Twilio

### WebSocket no conecta
1. Verificar CORS configuration
2. Asegurar que el cliente se une a la sala correcta
3. Revisar logs del WebSocket Gateway

## Próximas Mejoras

- [ ] Preferencias de notificación por usuario
- [ ] Templates de email personalizables desde admin
- [ ] Soporte para WhatsApp
- [ ] Analytics de notificaciones
- [ ] Reintento automático en fallos