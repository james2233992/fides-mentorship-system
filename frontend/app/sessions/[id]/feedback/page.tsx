'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, Star, Calendar, Clock, Video, CheckCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAppSelector } from '@/store/hooks'
import { useToast } from '@/hooks/use-toast'
import axios from '@/lib/api/axios'

interface Session {
  id: string
  title: string
  scheduledAt: string
  duration: number
  status: string
  meetingLink?: string
  mentor: {
    id: string
    firstName: string
    lastName: string
    email: string
    profilePicture?: string
  }
  mentee: {
    id: string
    firstName: string
    lastName: string
    email: string
    profilePicture?: string
  }
}

interface Feedback {
  id?: string
  sessionId: string
  rating: number
  feedback?: string
  mentorNotes?: string
  createdAt?: string
  updatedAt?: string
}

const ratingLabels = [
  { value: 1, label: 'Muy insatisfecho', emoji: '😞' },
  { value: 2, label: 'Insatisfecho', emoji: '😕' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Satisfecho', emoji: '😊' },
  { value: 5, label: 'Muy satisfecho', emoji: '😄' },
]

export default function SessionFeedbackPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAppSelector((state) => state.auth)
  const sessionId = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [existingFeedback, setExistingFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState<string>('')
  const [feedback, setFeedback] = useState('')
  const [mentorNotes, setMentorNotes] = useState('')
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)

  useEffect(() => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para dar feedback',
        variant: 'destructive',
      })
      router.push('/login')
      return
    }
    fetchSessionAndFeedback()
  }, [user, sessionId])

  const fetchSessionAndFeedback = async () => {
    try {
      // Fetch session details
      const sessionResponse = await axios.get(`/sessions/${sessionId}`)
      setSession(sessionResponse.data)

      // Try to fetch existing feedback
      try {
        const feedbackResponse = await axios.get(`/feedback/session/${sessionId}`)
        setExistingFeedback(feedbackResponse.data)
        setRating(feedbackResponse.data.rating.toString())
        setFeedback(feedbackResponse.data.feedback || '')
        setMentorNotes(feedbackResponse.data.mentorNotes || '')
      } catch (error: any) {
        // No existing feedback, which is fine
        if (error.response?.status !== 404) {
          console.error('Error fetching feedback:', error)
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información de la sesión',
        variant: 'destructive',
      })
      router.back()
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!rating && isMentee) {
      toast({
        title: 'Rating requerido',
        description: 'Por favor califica tu experiencia',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      const feedbackData: any = {
        sessionId,
      }

      if (isMentee) {
        feedbackData.rating = parseInt(rating)
        feedbackData.feedback = feedback
      }

      if (isMentor) {
        feedbackData.mentorNotes = mentorNotes
      }

      if (existingFeedback?.id) {
        await axios.patch(`/feedback/${existingFeedback.id}`, feedbackData)
      } else {
        await axios.post('/feedback', feedbackData)
      }

      toast({
        title: 'Feedback guardado',
        description: 'Tu feedback ha sido guardado exitosamente',
      })

      router.push('/sessions')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo guardar el feedback',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isMentor = user?.id === session.mentor.id
  const isMentee = user?.id === session.mentee.id
  const otherUser = isMentor ? session.mentee : session.mentor

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
        <h1 className="text-2xl font-bold">Feedback de Sesión</h1>
      </div>

      {/* Información de la sesión */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{session.title}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(session.scheduledAt), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(session.scheduledAt), 'HH:mm')} - {session.duration} min
                  </span>
                </div>
              </CardDescription>
            </div>
            <Badge variant={session.status === 'COMPLETED' ? 'default' : 'secondary'}>
              {session.status === 'COMPLETED' ? 'Completada' : session.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={otherUser.profilePicture} />
              <AvatarFallback>
                {otherUser.firstName?.charAt(0)?.toUpperCase()}
                {otherUser.lastName?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {isMentor ? 'Estudiante' : 'Mentor'}: {otherUser.firstName} {otherUser.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{otherUser.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {session.status !== 'COMPLETED' ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Solo puedes dar feedback después de que la sesión haya sido completada.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Calificación (solo para mentees) */}
          {isMentee && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>¿Cómo fue tu experiencia?</CardTitle>
                <CardDescription>
                  Tu feedback nos ayuda a mejorar la calidad de las mentorías
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base mb-4 block">Califica tu sesión</Label>
                  <div className="flex justify-center gap-4 mb-4">
                    {ratingLabels.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setRating(item.value.toString())}
                        onMouseEnter={() => setHoveredRating(item.value)}
                        onMouseLeave={() => setHoveredRating(null)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                          rating === item.value.toString()
                            ? 'bg-primary text-primary-foreground scale-110'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span className="text-2xl">{item.emoji}</span>
                        <Star
                          className={`h-6 w-6 ${
                            parseInt(rating) >= item.value || (hoveredRating && hoveredRating >= item.value)
                              ? 'fill-current'
                              : ''
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {(rating || hoveredRating) && (
                    <p className="text-center text-sm text-muted-foreground">
                      {ratingLabels.find(r => r.value === (hoveredRating || parseInt(rating)))?.label}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="feedback">
                    Comentarios (opcional)
                  </Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Comparte tu experiencia, qué te gustó, qué se podría mejorar..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notas del mentor (solo para mentores) */}
          {isMentor && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Notas privadas</CardTitle>
                <CardDescription>
                  Estas notas son privadas y no serán visibles para el estudiante
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={mentorNotes}
                  onChange={(e) => setMentorNotes(e.target.value)}
                  placeholder="Registra observaciones sobre el progreso del estudiante, áreas de mejora, próximos pasos..."
                  rows={6}
                />
              </CardContent>
            </Card>
          )}

          {existingFeedback && (
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Ya has enviado feedback para esta sesión. Puedes actualizarlo si lo deseas.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || (!rating && isMentee)}
            >
              {submitting ? 'Guardando...' : existingFeedback ? 'Actualizar Feedback' : 'Enviar Feedback'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}