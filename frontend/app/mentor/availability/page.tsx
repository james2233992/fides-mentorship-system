'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Save, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import axios from '@/lib/api/axios'
import { useToast } from '@/hooks/use-toast'
import { useAppSelector } from '@/store/hooks'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronLeft } from 'lucide-react'

interface TimeSlot {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isRecurring: boolean
}

interface BlockedDate {
  id?: string
  date: Date
  reason?: string
}

const daysOfWeek = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' }
]

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? '00' : '30'
  return {
    value: `${hour.toString().padStart(2, '0')}:${minute}`,
    label: `${hour.toString().padStart(2, '0')}:${minute}`
  }
})

export default function MentorAvailabilityPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAppSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [autoAccept, setAutoAccept] = useState(true)
  const [maxSessionsPerDay, setMaxSessionsPerDay] = useState('3')

  useEffect(() => {
    if (!user || (user.role?.toUpperCase() !== 'MENTOR' && user.role?.toUpperCase() !== 'ADMIN')) {
      router.push('/login')
      return
    }
    fetchAvailability()
  }, [user, router])

  const fetchAvailability = async () => {
    try {
      const response = await axios.get('/availability')
      setTimeSlots(response.data)
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '10:00',
      isRecurring: true
    }])
  }

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: any) => {
    const updated = [...timeSlots]
    updated[index] = { ...updated[index], [field]: value }
    setTimeSlots(updated)
  }

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index))
  }

  const addBlockedDate = () => {
    if (!selectedDate) return
    
    if (blockedDates.some(bd => bd.date.toDateString() === selectedDate.toDateString())) {
      toast({
        title: 'Error',
        description: 'Esta fecha ya está bloqueada',
        variant: 'destructive'
      })
      return
    }

    setBlockedDates([...blockedDates, { date: selectedDate }])
    setSelectedDate(undefined)
  }

  const removeBlockedDate = (index: number) => {
    setBlockedDates(blockedDates.filter((_, i) => i !== index))
  }

  const saveAvailability = async () => {
    if (timeSlots.length === 0) {
      toast({
        title: 'Sin disponibilidad',
        description: 'Debes agregar al menos un horario',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    try {
      await axios.post('/availability/bulk', {
        slots: timeSlots
      })
      
      toast({
        title: 'Disponibilidad actualizada',
        description: 'Tu disponibilidad ha sido guardada correctamente'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la disponibilidad',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/mentor')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Mi Disponibilidad</h1>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Define tu horario de disponibilidad para que los estudiantes puedan agendar sesiones contigo.
          Los horarios se muestran en tu zona horaria local.
        </AlertDescription>
      </Alert>

      {/* Horarios recurrentes */}
      <Card>
        <CardHeader>
          <CardTitle>Horarios Disponibles</CardTitle>
          <CardDescription>
            Define los horarios en los que estás disponible para dar mentorías
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {timeSlots.map((slot, index) => (
            <div key={index} className="flex items-end gap-4 p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Label>Día de la semana</Label>
                <Select 
                  value={slot.dayOfWeek.toString()} 
                  onValueChange={(value) => updateTimeSlot(index, 'dayOfWeek', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map(day => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 space-y-2">
                <Label>Hora de inicio</Label>
                <Select 
                  value={slot.startTime} 
                  onValueChange={(value) => updateTimeSlot(index, 'startTime', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(time => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 space-y-2">
                <Label>Hora de fin</Label>
                <Select 
                  value={slot.endTime} 
                  onValueChange={(value) => updateTimeSlot(index, 'endTime', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map(time => (
                      <SelectItem key={time.value} value={time.value}>
                        {time.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => removeTimeSlot(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={addTimeSlot}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar horario
          </Button>
        </CardContent>
      </Card>

      {/* Fechas bloqueadas */}
      <Card>
        <CardHeader>
          <CardTitle>Fechas No Disponibles</CardTitle>
          <CardDescription>
            Bloquea fechas específicas en las que no estarás disponible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal flex-1",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={addBlockedDate} disabled={!selectedDate}>
              <Plus className="h-4 w-4 mr-2" />
              Bloquear fecha
            </Button>
          </div>

          {blockedDates.length > 0 ? (
            <div className="space-y-2">
              {blockedDates.map((blocked, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">
                    {format(blocked.date, "PPP", { locale: es })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBlockedDate(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No hay fechas bloqueadas
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Preferencias */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
          <CardDescription>
            Configura tus preferencias de programación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-accept">Aceptar automáticamente</Label>
              <p className="text-sm text-muted-foreground">
                Las solicitudes de mentoría se aceptarán automáticamente
              </p>
            </div>
            <Switch
              id="auto-accept"
              checked={autoAccept}
              onCheckedChange={setAutoAccept}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-sessions">Máximo de sesiones por día</Label>
            <Select value={maxSessionsPerDay} onValueChange={setMaxSessionsPerDay}>
              <SelectTrigger id="max-sessions">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'sesión' : 'sesiones'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={saveAvailability}
          disabled={saving}
        >
          {saving ? (
            'Guardando...'
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Disponibilidad
            </>
          )}
        </Button>
      </div>
    </div>
  )
}