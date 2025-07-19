'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, Clock, Calendar as CalendarIcon, Video, MessageSquare, AlertCircle } from 'lucide-react'
import { format, addDays, setHours, setMinutes, isBefore, isAfter, startOfDay, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAppSelector } from '@/store/hooks'
import { useToast } from '@/hooks/use-toast'
import axios from '@/lib/api/axios'

interface Mentor {
  id: string
  firstName: string
  lastName: string
  email: string
  bio: string
  expertise: string
  profilePicture?: string
}

interface TimeSlot {
  time: string
  available: boolean
}

const sessionDurations = [
  { value: '30', label: '30 minutos' },
  { value: '45', label: '45 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1 hora 30 minutos' },
]

export default function ScheduleSessionPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAppSelector((state) => state.auth)
  const mentorId = params.id as string

  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [duration, setDuration] = useState('60')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])

  useEffect(() => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para agendar una sesión',
        variant: 'destructive',
      })
      router.push('/login')
      return
    }
    fetchMentor()
  }, [user, mentorId])

  useEffect(() => {
    if (selectedDate && mentorId) {
      fetchAvailableSlots()
    }
  }, [selectedDate, mentorId])

  const fetchAvailableSlots = async () => {
    try {
      const formattedDate = format(selectedDate!, 'yyyy-MM-dd')
      const response = await axios.get(`/availability/mentor/${mentorId}/slots?date=${formattedDate}`)
      setAvailableSlots(response.data)
    } catch (error) {
      console.error('Error fetching available slots:', error)
      setAvailableSlots([])
    }
  }

  const fetchMentor = async () => {
    try {
      const response = await axios.get(`/users/${mentorId}`)
      setMentor(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información del mentor',
        variant: 'destructive',
      })
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !title) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      // Combinar fecha y hora
      const [hours, minutes] = selectedTime.split(':').map(Number)
      const scheduledAt = setMinutes(setHours(selectedDate, hours), minutes)

      const sessionData = {
        mentorId,
        title,
        description,
        scheduledAt: scheduledAt.toISOString(),
        duration: parseInt(duration),
        type: 'ONE_ON_ONE' as const,
      }

      await axios.post('/sessions', sessionData)

      toast({
        title: 'Sesión agendada',
        description: 'Tu sesión ha sido agendada exitosamente. Recibirás una confirmación por email.',
      })

      router.push('/mentee/sessions')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo agendar la sesión',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const disabledDays = {
    before: new Date(),
    after: addDays(new Date(), 60), // Permitir agendar hasta 60 días en el futuro
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!mentor) {
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Agendar Sesión de Mentoría</h1>
      </div>

      {/* Información del mentor */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mentor.profilePicture} />
              <AvatarFallback>
                {mentor.firstName?.charAt(0)?.toUpperCase()}
                {mentor.lastName?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{mentor.firstName} {mentor.lastName}</CardTitle>
              <CardDescription className="mt-1">
                {mentor.bio || 'Mentor especializado'}
              </CardDescription>
              {mentor.expertise && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {mentor.expertise.split(',').slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selección de fecha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Selecciona una fecha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={disabledDays}
              locale={es}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Selección de hora y detalles */}
        <div className="space-y-6">
          {/* Horarios disponibles */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horarios disponibles
                </CardTitle>
                <CardDescription>
                  {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? 'default' : 'outline'}
                      size="sm"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className="w-full"
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Duración */}
          {selectedTime && (
            <Card>
              <CardHeader>
                <CardTitle>Duración de la sesión</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={duration} onValueChange={setDuration}>
                  {sessionDurations.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Detalles de la sesión */}
      {selectedDate && selectedTime && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Detalles de la sesión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título de la sesión *</Label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Revisión de portfolio y consejos de carrera"
                className="w-full px-3 py-2 border rounded-md mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">
                Descripción (opcional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe los temas que te gustaría tratar en la sesión..."
                rows={4}
                className="mt-1"
              />
            </div>

            <Alert>
              <Video className="h-4 w-4" />
              <AlertDescription>
                La sesión se realizará por videollamada. Recibirás el enlace de conexión por email 
                15 minutos antes del inicio.
              </AlertDescription>
            </Alert>

            {/* Resumen */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold">Resumen de tu sesión:</h4>
              <p className="text-sm text-gray-600">
                <strong>Mentor:</strong> {mentor.firstName} {mentor.lastName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Fecha:</strong> {format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Hora:</strong> {selectedTime} - {
                  format(
                    setMinutes(
                      setHours(new Date(), parseInt(selectedTime.split(':')[0])), 
                      parseInt(selectedTime.split(':')[1]) + parseInt(duration)
                    ),
                    'HH:mm'
                  )
                }
              </p>
              <p className="text-sm text-gray-600">
                <strong>Duración:</strong> {sessionDurations.find(d => d.value === duration)?.label}
              </p>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSubmit}
              disabled={submitting || !title}
            >
              {submitting ? 'Agendando...' : 'Confirmar y Agendar Sesión'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}