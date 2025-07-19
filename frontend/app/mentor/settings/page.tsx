'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { 
  User, 
  Bell, 
  Calendar, 
  Shield, 
  Save,
  Upload,
  Plus,
  X,
  Clock,
  Globe,
  Mail,
  MessageSquare
} from 'lucide-react'
import axios from '@/lib/api/axios'
import { useAppSelector } from '@/store/hooks'

interface MentorSettings {
  profile: {
    bio: string
    expertise: string[]
    languages: string[]
    linkedIn: string
    website: string
    profilePicture?: string
    yearsOfExperience: number
    hourlyRate?: number
    displayRate: boolean
  }
  availability: {
    timezone: string
    workingDays: string[]
    workingHours: {
      start: string
      end: string
    }
    bufferTime: number
    maxSessionsPerDay: number
    autoAcceptRequests: boolean
    vacationMode: boolean
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    newRequestAlert: boolean
    sessionReminderAlert: boolean
    cancellationAlert: boolean
    reviewAlert: boolean
    reminderTime: number
  }
  privacy: {
    showEmail: boolean
    showPhone: boolean
    showFullName: boolean
    showAvailability: boolean
    acceptTerms: boolean
  }
}

export default function MentorSettingsPage() {
  const { user } = useAppSelector((state) => state.auth)
  const [settings, setSettings] = useState<MentorSettings>({
    profile: {
      bio: '',
      expertise: [],
      languages: ['Español'],
      linkedIn: '',
      website: '',
      yearsOfExperience: 0,
      displayRate: false
    },
    availability: {
      timezone: 'America/Bogota',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      workingHours: {
        start: '09:00',
        end: '18:00'
      },
      bufferTime: 15,
      maxSessionsPerDay: 5,
      autoAcceptRequests: false,
      vacationMode: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      newRequestAlert: true,
      sessionReminderAlert: true,
      cancellationAlert: true,
      reviewAlert: true,
      reminderTime: 24
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      showFullName: true,
      showAvailability: true,
      acceptTerms: false
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newExpertise, setNewExpertise] = useState('')
  const [newLanguage, setNewLanguage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/mentor/settings')
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
      await axios.put('/mentor/settings', settings)
      toast({
        title: 'Configuraciones guardadas',
        description: 'Tus preferencias han sido actualizadas exitosamente'
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

  const addExpertise = () => {
    if (newExpertise && !settings.profile.expertise.includes(newExpertise)) {
      setSettings({
        ...settings,
        profile: {
          ...settings.profile,
          expertise: [...settings.profile.expertise, newExpertise]
        }
      })
      setNewExpertise('')
    }
  }

  const removeExpertise = (skill: string) => {
    setSettings({
      ...settings,
      profile: {
        ...settings.profile,
        expertise: settings.profile.expertise.filter(s => s !== skill)
      }
    })
  }

  const addLanguage = () => {
    if (newLanguage && !settings.profile.languages.includes(newLanguage)) {
      setSettings({
        ...settings,
        profile: {
          ...settings.profile,
          languages: [...settings.profile.languages, newLanguage]
        }
      })
      setNewLanguage('')
    }
  }

  const removeLanguage = (language: string) => {
    setSettings({
      ...settings,
      profile: {
        ...settings.profile,
        languages: settings.profile.languages.filter(l => l !== language)
      }
    })
  }

  const toggleWorkingDay = (day: string) => {
    const workingDays = settings.availability.workingDays
    if (workingDays.includes(day)) {
      setSettings({
        ...settings,
        availability: {
          ...settings.availability,
          workingDays: workingDays.filter(d => d !== day)
        }
      })
    } else {
      setSettings({
        ...settings,
        availability: {
          ...settings.availability,
          workingDays: [...workingDays, day]
        }
      })
    }
  }

  if (loading) {
    return <div>Cargando configuraciones...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuración del Mentor</h2>
          <p className="text-muted-foreground">
            Gestiona tu perfil y preferencias como mentor
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="privacy">Privacidad</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Perfil Profesional
              </CardTitle>
              <CardDescription>
                Información que verán los mentees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={settings.profile.profilePicture} />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Cambiar foto
                </Button>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={settings.profile.bio}
                  onChange={(e) => setSettings({
                    ...settings,
                    profile: { ...settings.profile, bio: e.target.value }
                  })}
                  placeholder="Cuéntale a los mentees sobre ti, tu experiencia y lo que pueden aprender contigo..."
                  rows={4}
                />
              </div>

              {/* Expertise */}
              <div className="space-y-2">
                <Label>Áreas de Expertise</Label>
                <div className="flex gap-2">
                  <Input
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    placeholder="Ej: React, Marketing Digital, Python..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                  />
                  <Button onClick={addExpertise} type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.profile.expertise.map(skill => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        onClick={() => removeExpertise(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label>Idiomas</Label>
                <div className="flex gap-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Ej: Inglés, Portugués..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                  />
                  <Button onClick={addLanguage} type="button">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.profile.languages.map(language => (
                    <Badge key={language} variant="outline" className="flex items-center gap-1">
                      {language}
                      <button
                        onClick={() => removeLanguage(language)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Professional Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="experience">Años de Experiencia</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={settings.profile.yearsOfExperience}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, yearsOfExperience: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={settings.profile.linkedIn}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, linkedIn: e.target.value }
                    })}
                    placeholder="https://linkedin.com/in/tu-perfil"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={settings.profile.website}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, website: e.target.value }
                    })}
                    placeholder="https://tu-sitio.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate">Tarifa por Hora (opcional)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={settings.profile.hourlyRate || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, hourlyRate: parseInt(e.target.value) || undefined }
                    })}
                    placeholder="$50000"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="displayRate">Mostrar tarifa en el perfil</Label>
                <Switch
                  id="displayRate"
                  checked={settings.profile.displayRate}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    profile: { ...settings.profile, displayRate: checked }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Configuración de Disponibilidad
              </CardTitle>
              <CardDescription>
                Define cuándo estás disponible para mentorías
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vacation Mode */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label className="text-base">Modo Vacaciones</Label>
                  <p className="text-sm text-muted-foreground">
                    Pausa temporalmente las nuevas solicitudes
                  </p>
                </div>
                <Switch
                  checked={settings.availability.vacationMode}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    availability: { ...settings.availability, vacationMode: checked }
                  })}
                />
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label>Zona Horaria</Label>
                <Select 
                  value={settings.availability.timezone}
                  onValueChange={(value) => setSettings({
                    ...settings,
                    availability: { ...settings.availability, timezone: value }
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

              {/* Working Days */}
              <div className="space-y-2">
                <Label>Días Laborables</Label>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    { value: 'monday', label: 'Lun' },
                    { value: 'tuesday', label: 'Mar' },
                    { value: 'wednesday', label: 'Mié' },
                    { value: 'thursday', label: 'Jue' },
                    { value: 'friday', label: 'Vie' },
                    { value: 'saturday', label: 'Sáb' },
                    { value: 'sunday', label: 'Dom' }
                  ].map(day => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={settings.availability.workingDays.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleWorkingDay(day.value)}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Working Hours */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Hora de Inicio</Label>
                  <Input
                    type="time"
                    value={settings.availability.workingHours.start}
                    onChange={(e) => setSettings({
                      ...settings,
                      availability: {
                        ...settings.availability,
                        workingHours: {
                          ...settings.availability.workingHours,
                          start: e.target.value
                        }
                      }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora de Fin</Label>
                  <Input
                    type="time"
                    value={settings.availability.workingHours.end}
                    onChange={(e) => setSettings({
                      ...settings,
                      availability: {
                        ...settings.availability,
                        workingHours: {
                          ...settings.availability.workingHours,
                          end: e.target.value
                        }
                      }
                    })}
                  />
                </div>
              </div>

              {/* Session Settings */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tiempo entre sesiones (min)</Label>
                  <Input
                    type="number"
                    value={settings.availability.bufferTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      availability: { ...settings.availability, bufferTime: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Máximo sesiones por día</Label>
                  <Input
                    type="number"
                    value={settings.availability.maxSessionsPerDay}
                    onChange={(e) => setSettings({
                      ...settings,
                      availability: { ...settings.availability, maxSessionsPerDay: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-aceptar solicitudes</Label>
                  <p className="text-sm text-muted-foreground">
                    Acepta automáticamente las solicitudes que cumplan con tu disponibilidad
                  </p>
                </div>
                <Switch
                  checked={settings.availability.autoAcceptRequests}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    availability: { ...settings.availability, autoAcceptRequests: checked }
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
                Preferencias de Notificaciones
              </CardTitle>
              <CardDescription>
                Controla cómo y cuándo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Channels */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label>Notificaciones por Email</Label>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailNotifications: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <Label>Notificaciones por SMS</Label>
                  </div>
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, smsNotifications: checked }
                    })}
                  />
                </div>
              </div>

              <Separator />

              {/* Notification Types */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Tipos de Notificaciones</h4>
                
                <div className="flex items-center justify-between">
                  <Label>Nuevas solicitudes de mentoría</Label>
                  <Switch
                    checked={settings.notifications.newRequestAlert}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, newRequestAlert: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Recordatorios de sesiones</Label>
                  <Switch
                    checked={settings.notifications.sessionReminderAlert}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, sessionReminderAlert: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Cancelaciones de sesiones</Label>
                  <Switch
                    checked={settings.notifications.cancellationAlert}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, cancellationAlert: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Nuevas reseñas</Label>
                  <Switch
                    checked={settings.notifications.reviewAlert}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, reviewAlert: checked }
                    })}
                  />
                </div>
              </div>

              <Separator />

              {/* Reminder Time */}
              <div className="space-y-2">
                <Label>Tiempo de recordatorio antes de las sesiones</Label>
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
                    <SelectItem value="15">15 minutos antes</SelectItem>
                    <SelectItem value="30">30 minutos antes</SelectItem>
                    <SelectItem value="60">1 hora antes</SelectItem>
                    <SelectItem value="120">2 horas antes</SelectItem>
                    <SelectItem value="1440">24 horas antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Privacidad
              </CardTitle>
              <CardDescription>
                Controla qué información es visible públicamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar email en el perfil</Label>
                    <p className="text-sm text-muted-foreground">
                      Los mentees podrán ver tu dirección de correo
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showEmail}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showEmail: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar teléfono en el perfil</Label>
                    <p className="text-sm text-muted-foreground">
                      Los mentees podrán ver tu número de teléfono
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showPhone}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showPhone: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar nombre completo</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar tu nombre completo en lugar de solo el nombre
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showFullName}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showFullName: checked }
                    })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mostrar disponibilidad</Label>
                    <p className="text-sm text-muted-foreground">
                      Los mentees podrán ver tus horarios disponibles
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showAvailability}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, showAvailability: checked }
                    })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Switch
                    id="terms"
                    checked={settings.privacy.acceptTerms}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      privacy: { ...settings.privacy, acceptTerms: checked }
                    })}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                      Acepto los términos y condiciones del servicio de mentoría
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Debes aceptar los términos para poder ofrecer mentorías
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}