'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Shield, Bell, Eye, Globe, Moon, Sun, Lock } from 'lucide-react'
import axiosInstance from '@/lib/api/axios'

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      sessionReminders: true,
      messageAlerts: true,
      marketingEmails: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true,
    },
    preferences: {
      language: 'es',
      timezone: 'Europe/Madrid',
      theme: 'light',
    },
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      fetchSettings()
    }
  }, [user, router])

  const fetchSettings = async () => {
    try {
      const response = await axiosInstance.get('/users/settings')
      setSettings(response.data)
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const updateSettings = async (section: string, data: any) => {
    setIsLoading(true)
    try {
      await axiosInstance.put(`/users/settings/${section}`, data)
      toast({
        title: 'Configuración actualizada',
        description: 'Los cambios se han guardado correctamente',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      await axiosInstance.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      
      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña se ha cambiado correctamente',
      })
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cambiar la contraseña',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestiona tus preferencias y configuración de cuenta</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="privacy">Privacidad</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo y cuándo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Notificaciones por email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones importantes en tu correo
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, email: checked },
                      })
                      updateSettings('notifications', { ...settings.notifications, email: checked })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="session-reminders">Recordatorios de sesiones</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe recordatorios antes de tus sesiones
                    </p>
                  </div>
                  <Switch
                    id="session-reminders"
                    checked={settings.notifications.sessionReminders}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, sessionReminders: checked },
                      })
                      updateSettings('notifications', { ...settings.notifications, sessionReminders: checked })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="message-alerts">Alertas de mensajes</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones cuando recibes nuevos mensajes
                    </p>
                  </div>
                  <Switch
                    id="message-alerts"
                    checked={settings.notifications.messageAlerts}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, messageAlerts: checked },
                      })
                      updateSettings('notifications', { ...settings.notifications, messageAlerts: checked })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails">Correos promocionales</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe ofertas y novedades de FIDES
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={settings.notifications.marketingEmails}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, marketingEmails: checked },
                      })
                      updateSettings('notifications', { ...settings.notifications, marketingEmails: checked })
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacidad
              </CardTitle>
              <CardDescription>
                Controla quién puede ver tu información
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">Visibilidad del perfil</Label>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value) => {
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, profileVisibility: value },
                      })
                      updateSettings('privacy', { ...settings.privacy, profileVisibility: value })
                    }}
                  >
                    <SelectTrigger id="profile-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Público</SelectItem>
                      <SelectItem value="members">Solo miembros</SelectItem>
                      <SelectItem value="private">Privado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-email">Mostrar email en perfil</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que otros vean tu correo electrónico
                    </p>
                  </div>
                  <Switch
                    id="show-email"
                    checked={settings.privacy.showEmail}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, showEmail: checked },
                      })
                      updateSettings('privacy', { ...settings.privacy, showEmail: checked })
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-messages">Permitir mensajes directos</Label>
                    <p className="text-sm text-muted-foreground">
                      Otros usuarios pueden enviarte mensajes
                    </p>
                  </div>
                  <Switch
                    id="allow-messages"
                    checked={settings.privacy.allowMessages}
                    onCheckedChange={(checked) => {
                      setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, allowMessages: checked },
                      })
                      updateSettings('privacy', { ...settings.privacy, allowMessages: checked })
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Preferencias
              </CardTitle>
              <CardDescription>
                Personaliza tu experiencia en FIDES
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => {
                      setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, language: value },
                      })
                      updateSettings('preferences', { ...settings.preferences, language: value })
                    }}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona horaria</Label>
                  <Select
                    value={settings.preferences.timezone}
                    onValueChange={(value) => {
                      setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, timezone: value },
                      })
                      updateSettings('preferences', { ...settings.preferences, timezone: value })
                    }}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                      <SelectItem value="Europe/London">Londres (GMT)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                      <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tema</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant={settings.preferences.theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, theme: 'light' },
                        })
                        updateSettings('preferences', { ...settings.preferences, theme: 'light' })
                      }}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Claro
                    </Button>
                    <Button
                      variant={settings.preferences.theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSettings({
                          ...settings,
                          preferences: { ...settings.preferences, theme: 'dark' },
                        })
                        updateSettings('preferences', { ...settings.preferences, theme: 'dark' })
                      }}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Oscuro
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Protege tu cuenta y cambia tu contraseña
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Contraseña actual</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="current-password"
                      type="password"
                      className="pl-10"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">Nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      className="pl-10"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      className="pl-10"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Actualizando...' : 'Cambiar contraseña'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-medium mb-4">Otras opciones de seguridad</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Configurar autenticación de dos factores
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver actividad de la cuenta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}