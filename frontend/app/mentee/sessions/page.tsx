'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Calendar, 
  Clock, 
  User, 
  Video, 
  MessageSquare, 
  Star,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import axios from '@/lib/api/axios'
import { toast } from '@/hooks/use-toast'

interface Session {
  id: string
  title: string
  description?: string
  scheduledAt: string
  duration: number
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  meetingLink?: string
  notes?: string
  rating?: number
  feedback?: string
  mentor: {
    id: string
    firstName: string
    lastName: string
    email: string
    expertise?: string
  }
}

export default function MenteeSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false)
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    feedback: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/sessions')
      setSessions(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las sesiones',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSession = (session: Session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank')
    } else {
      toast({
        title: 'Enlace no disponible',
        description: 'El enlace de la reunión aún no está disponible',
        variant: 'destructive'
      })
    }
  }

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm('¿Estás seguro de cancelar esta sesión?')) return

    try {
      await axios.patch(`/sessions/${sessionId}`, { status: 'CANCELLED' })
      toast({
        title: 'Sesión cancelada',
        description: 'La sesión ha sido cancelada exitosamente'
      })
      fetchSessions()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la sesión',
        variant: 'destructive'
      })
    }
  }

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSession) return

    setSubmitting(true)
    try {
      await axios.post(`/sessions/${selectedSession.id}/feedback`, feedbackData)
      toast({
        title: 'Feedback enviado',
        description: 'Gracias por tu retroalimentación'
      })
      setIsFeedbackDialogOpen(false)
      setFeedbackData({ rating: 5, feedback: '' })
      fetchSessions()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el feedback',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { variant: any; label: string; icon: any } } = {
      SCHEDULED: { variant: 'default', label: 'Programada', icon: <Calendar className="h-3 w-3" /> },
      IN_PROGRESS: { variant: 'secondary', label: 'En progreso', icon: <Video className="h-3 w-3" /> },
      COMPLETED: { variant: 'success', label: 'Completada', icon: <CheckCircle className="h-3 w-3" /> },
      CANCELLED: { variant: 'destructive', label: 'Cancelada', icon: <XCircle className="h-3 w-3" /> }
    }
    const config = variants[status] || variants.SCHEDULED
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const canJoinSession = (session: Session) => {
    const now = new Date()
    const sessionStart = new Date(session.scheduledAt)
    const fifteenMinutesBefore = new Date(sessionStart.getTime() - 15 * 60000)
    return session.status === 'SCHEDULED' && now >= fifteenMinutesBefore && now <= sessionStart
  }

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.mentor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.mentor.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Mis Sesiones</h2>
        <p className="text-muted-foreground">
          Gestiona tus sesiones de mentoría
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por título o mentor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las sesiones</SelectItem>
                <SelectItem value="SCHEDULED">Programadas</SelectItem>
                <SelectItem value="IN_PROGRESS">En progreso</SelectItem>
                <SelectItem value="COMPLETED">Completadas</SelectItem>
                <SelectItem value="CANCELLED">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {searchTerm || filterStatus !== 'all'
              ? 'No se encontraron sesiones con los filtros aplicados'
              : 'No tienes sesiones programadas. ¡Busca un mentor y solicita tu primera sesión!'}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map(session => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <CardDescription>
                      {session.description || 'Sin descripción'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>Mentor:</strong> {session.mentor.firstName} {session.mentor.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>Fecha:</strong> {format(new Date(session.scheduledAt), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <strong>Hora:</strong> {format(new Date(session.scheduledAt), 'HH:mm')} ({session.duration} min)
                    </span>
                  </div>
                  {session.mentor.expertise && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <strong>Área:</strong> {session.mentor.expertise}
                      </span>
                    </div>
                  )}
                </div>

                {session.notes && (
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm"><strong>Notas:</strong></p>
                    <p className="text-sm text-muted-foreground mt-1">{session.notes}</p>
                  </div>
                )}

                {session.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < session.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Tu calificación: {session.rating}/5
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  {session.status === 'SCHEDULED' && (
                    <>
                      {canJoinSession(session) && (
                        <Button onClick={() => handleJoinSession(session)}>
                          <Video className="h-4 w-4 mr-2" />
                          Unirse a la sesión
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelSession(session.id)}
                      >
                        Cancelar sesión
                      </Button>
                    </>
                  )}
                  
                  {session.status === 'COMPLETED' && !session.rating && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedSession(session)
                        setIsFeedbackDialogOpen(true)
                      }}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Dejar feedback
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calificar sesión</DialogTitle>
            <DialogDescription>
              Comparte tu experiencia con {selectedSession?.mentor.firstName} {selectedSession?.mentor.lastName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitFeedback}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Calificación</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFeedbackData({ ...feedbackData, rating: value })}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          value <= feedbackData.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {feedbackData.rating}/5
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Comentarios (opcional)</Label>
                <Textarea
                  id="feedback"
                  value={feedbackData.feedback}
                  onChange={(e) => setFeedbackData({ ...feedbackData, feedback: e.target.value })}
                  placeholder="¿Cómo fue tu experiencia?"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar feedback'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}