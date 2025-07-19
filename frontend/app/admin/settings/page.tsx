'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { 
  Settings, 
  Bell, 
  Clock, 
  Shield, 
  Database, 
  Mail,
  MessageSquare,
  Save,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import axios from '@/lib/api/axios'

interface SystemSettings {
  general: {
    systemName: string
    systemEmail: string
    timezone: string
    language: string
    maintenanceMode: boolean
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    pushEnabled: boolean
    emailProvider: 'sendgrid' | 'smtp' | 'ethereal'
    smsProvider: 'twilio' | 'none'
    sendReminders: boolean
    reminderTime: number // hours before session
  }
  sessions: {
    defaultDuration: number
    minDuration: number
    maxDuration: number
    bufferTime: number // minutes between sessions
    autoAcceptRequests: boolean
    maxSessionsPerDay: number
    allowWeekends: boolean
  }
  security: {
    passwordMinLength: number
    requireUppercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    sessionTimeout: number // minutes
    maxLoginAttempts: number
    enableTwoFactor: boolean
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      systemName: 'FIDES Mentorship System',
      systemEmail: 'noreply@fides.edu',
      timezone: 'America/Bogota',
      language: 'es',
      maintenanceMode: false
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: false,
      emailProvider: 'sendgrid',
      smsProvider: 'none',
      sendReminders: true,
      reminderTime: 24
    },
    sessions: {
      defaultDuration: 60,
      minDuration: 30,
      maxDuration: 120,
      bufferTime: 15,
      autoAcceptRequests: false,
      maxSessionsPerDay: 5,
      allowWeekends: false
    },
    security: {
      passwordMinLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      enableTwoFactor: false
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/settings')
      setSettings(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las configuraciones',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await axios.put('/settings', settings)
      toast({
        title: 'Configuraciones guardadas',
        description: 'Los cambios han sido aplicados exitosamente'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las configuraciones',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefaults = () => {
    if (!confirm('¿Estás seguro de restaurar las configuraciones por defecto?')) return
    
    setSettings({
      general: {
        systemName: 'FIDES Mentorship System',
        systemEmail: 'noreply@fides.edu',
        timezone: 'America/Bogota',
        language: 'es',
        maintenanceMode: false
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: false,
        emailProvider: 'sendgrid',
        smsProvider: 'none',
        sendReminders: true,
        reminderTime: 24
      },
      sessions: {
        defaultDuration: 60,
        minDuration: 30,
        maxDuration: 120,
        bufferTime: 15,
        autoAcceptRequests: false,
        maxSessionsPerDay: 5,
        allowWeekends: false
      },
      security: {
        passwordMinLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
        enableTwoFactor: false
      }
    })
    
    toast({
      title: 'Configuraciones restauradas',
      description: 'Se han restaurado las configuraciones por defecto'
    })
  }

  if (loading) {
    return <div>Cargando configuraciones...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración del Sistema</h2>
          <p className="text-muted-foreground">
            Gestiona las configuraciones globales del sistema de mentoría
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar valores
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="sessions">Sesiones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración General
              </CardTitle>
              <CardDescription>
                Ajustes básicos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="systemName">Nombre del Sistema</Label>
                  <Input
                    id="systemName"
                    value={settings.general.systemName}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, systemName: e.target.value }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="systemEmail">Email del Sistema</Label>
                  <Input
                    id="systemEmail"
                    type="email"
                    value={settings.general.systemEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, systemEmail: e.target.value }
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select 
                    value={settings.general.timezone}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, timezone: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Bogota">Colombia (UTC-5)</SelectItem>
                      <SelectItem value="America/Mexico_City">México (UTC-6)</SelectItem>
                      <SelectItem value="America/Argentina/Buenos_Aires">Argentina (UTC-3)</SelectItem>
                      <SelectItem value="Europe/Madrid">España (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select 
                    value={settings.general.language}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      general: { ...settings.general, language: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance">Modo de Mantenimiento</Label>
                  <p className="text-sm text-muted-foreground">
                    Activa el modo de mantenimiento para realizar actualizaciones
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    general: { ...settings.general, maintenanceMode: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>
                Gestiona cómo se envían las notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Notificaciones por Email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificaciones por correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailEnabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailEnabled: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Notificaciones por SMS
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificaciones por mensaje de texto
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsEnabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, smsEnabled: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recordatorios Automáticos</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar recordatorios antes de las sesiones
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.sendReminders}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, sendReminders: checked }
                    })}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Proveedor de Email</Label>
                  <Select 
                    value={settings.notifications.emailProvider}
                    onValueChange={(value: any) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailProvider: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="ethereal">Ethereal (Testing)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tiempo de Recordatorio</Label>
                  <Select 
                    value={settings.notifications.reminderTime.toString()}
                    onValueChange={(value) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, reminderTime: parseInt(value) }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora antes</SelectItem>
                      <SelectItem value="2">2 horas antes</SelectItem>
                      <SelectItem value="24">24 horas antes</SelectItem>
                      <SelectItem value="48">48 horas antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Configuración de Sesiones
              </CardTitle>
              <CardDescription>
                Define las reglas para las sesiones de mentoría
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Duración por Defecto (min)</Label>
                  <Input
                    type="number"
                    value={settings.sessions.defaultDuration}
                    onChange={(e) => setSettings({
                      ...settings,
                      sessions: { ...settings.sessions, defaultDuration: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duración Mínima (min)</Label>
                  <Input
                    type="number"
                    value={settings.sessions.minDuration}
                    onChange={(e) => setSettings({
                      ...settings,
                      sessions: { ...settings.sessions, minDuration: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Duración Máxima (min)</Label>
                  <Input
                    type="number"
                    value={settings.sessions.maxDuration}
                    onChange={(e) => setSettings({
                      ...settings,
                      sessions: { ...settings.sessions, maxDuration: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tiempo entre Sesiones (min)</Label>
                  <Input
                    type="number"
                    value={settings.sessions.bufferTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      sessions: { ...settings.sessions, bufferTime: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Máximo de Sesiones por Día</Label>
                  <Input
                    type="number"
                    value={settings.sessions.maxSessionsPerDay}
                    onChange={(e) => setSettings({
                      ...settings,
                      sessions: { ...settings.sessions, maxSessionsPerDay: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-aceptar Solicitudes</Label>
                    <p className="text-sm text-muted-foreground">
                      Aceptar automáticamente las solicitudes de mentoría
                    </p>
                  </div>
                  <Switch
                    checked={settings.sessions.autoAcceptRequests}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      sessions: { ...settings.sessions, autoAcceptRequests: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Permitir Sesiones en Fines de Semana</Label>
                    <p className="text-sm text-muted-foreground">
                      Habilitar la programación de sesiones en sábados y domingos
                    </p>
                  </div>
                  <Switch
                    checked={settings.sessions.allowWeekends}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      sessions: { ...settings.sessions, allowWeekends: checked }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Seguridad
              </CardTitle>
              <CardDescription>
                Políticas de seguridad del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Longitud Mínima de Contraseña</Label>
                  <Input
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tiempo de Sesión (min)</Label>
                  <Input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Intentos Máximos de Login</Label>
                  <Input
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Requisitos de Contraseña</h4>
                
                <div className="flex items-center justify-between">
                  <Label>Requerir Mayúsculas</Label>
                  <Switch
                    checked={settings.security.requireUppercase}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security: { ...settings.security, requireUppercase: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Requerir Números</Label>
                  <Switch
                    checked={settings.security.requireNumbers}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security: { ...settings.security, requireNumbers: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Requerir Caracteres Especiales</Label>
                  <Switch
                    checked={settings.security.requireSpecialChars}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security: { ...settings.security, requireSpecialChars: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de Dos Factores</Label>
                    <p className="text-sm text-muted-foreground">
                      Requerir 2FA para todos los usuarios
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.enableTwoFactor}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      security: { ...settings.security, enableTwoFactor: checked }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}