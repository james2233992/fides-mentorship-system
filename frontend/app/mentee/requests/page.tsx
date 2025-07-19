'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  User, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  BookOpen,
  Target
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import axios from '@/lib/api/axios'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface MentorshipRequest {
  id: string
  message: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  mentor: {
    id: string
    firstName: string
    lastName: string
    email: string
    expertise?: string
    bio?: string
    rating?: number
    totalSessions?: number
  }
  proposedSchedule?: {
    date: string
    time: string
    duration: number
  }
}

interface Mentor {
  id: string
  firstName: string
  lastName: string
  email: string
  expertise?: string
  bio?: string
  rating?: number
  totalSessions?: number
  isAvailable: boolean
}

export default function MenteeRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<MentorshipRequest[]>([])
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewRequestDialogOpen, setIsNewRequestDialogOpen] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [requestData, setRequestData] = useState({
    message: '',
    proposedDate: '',
    proposedTime: '',
    duration: '60'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [requestsRes, mentorsRes] = await Promise.all([
        axios.get('/mentorship-requests'),
        axios.get('/users/mentors')
      ])
      setRequests(requestsRes.data)
      setMentors(mentorsRes.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMentor) return

    setSubmitting(true)
    try {
      const payload = {
        mentorId: selectedMentor.id,
        message: requestData.message,
        proposedSchedule: requestData.proposedDate && requestData.proposedTime ? {
          date: requestData.proposedDate,
          time: requestData.proposedTime,
          duration: parseInt(requestData.duration)
        } : undefined
      }

      await axios.post('/mentorship-requests', payload)
      toast({
        title: 'Solicitud enviada',
        description: 'Tu solicitud de mentoría ha sido enviada exitosamente'
      })
      
      setIsNewRequestDialogOpen(false)
      setSelectedMentor(null)
      setRequestData({
        message: '',
        proposedDate: '',
        proposedTime: '',
        duration: '60'
      })
      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo enviar la solicitud',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('¿Estás seguro de cancelar esta solicitud?')) return

    try {
      await axios.delete(`/mentorship-requests/${requestId}`)
      toast({
        title: 'Solicitud cancelada',
        description: 'La solicitud ha sido cancelada exitosamente'
      })
      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la solicitud',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { variant: any; label: string; icon: any } } = {
      PENDING: { variant: 'default', label: 'Pendiente', icon: <Clock className="h-3 w-3" /> },
      ACCEPTED: { variant: 'success', label: 'Aceptada', icon: <CheckCircle className="h-3 w-3" /> },
      REJECTED: { variant: 'destructive', label: 'Rechazada', icon: <XCircle className="h-3 w-3" /> }
    }
    const config = variants[status] || variants.PENDING
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.mentor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.mentor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Solicitudes de Mentoría</h2>
          <p className="text-muted-foreground">
            Gestiona tus solicitudes de mentoría
          </p>
        </div>
        <Dialog open={isNewRequestDialogOpen} onOpenChange={setIsNewRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Nueva Solicitud
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Nueva Solicitud de Mentoría</DialogTitle>
              <DialogDescription>
                {selectedMentor 
                  ? `Enviar solicitud a ${selectedMentor.firstName} ${selectedMentor.lastName}`
                  : 'Selecciona un mentor y envía tu solicitud'}
              </DialogDescription>
            </DialogHeader>
            {!selectedMentor ? (
              <div className="space-y-4">
                <div className="max-h-[400px] overflow-y-auto space-y-3">
                  {mentors.filter(m => m.isAvailable).map(mentor => (
                    <Card 
                      key={mentor.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedMentor(mentor)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h4 className="font-medium">{mentor.firstName} {mentor.lastName}</h4>
                            {mentor.expertise && (
                              <p className="text-sm text-muted-foreground">{mentor.expertise}</p>
                            )}
                            {mentor.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {mentor.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-sm font-medium">{mentor.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {mentor.totalSessions !== undefined && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {mentor.totalSessions} sesiones
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest}>
                <div className="space-y-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{selectedMentor.firstName} {selectedMentor.lastName}</p>
                        {selectedMentor.expertise && (
                          <p className="text-sm text-muted-foreground">{selectedMentor.expertise}</p>
                        )}
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedMentor(null)}
                      >
                        Cambiar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      value={requestData.message}
                      onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                      placeholder="Hola, me gustaría recibir mentoría sobre..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha propuesta (opcional)</Label>
                      <Input
                        id="date"
                        type="date"
                        value={requestData.proposedDate}
                        onChange={(e) => setRequestData({ ...requestData, proposedDate: e.target.value })}
                        min={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Hora propuesta</Label>
                      <Input
                        id="time"
                        type="time"
                        value={requestData.proposedTime}
                        onChange={(e) => setRequestData({ ...requestData, proposedTime: e.target.value })}
                        disabled={!requestData.proposedDate}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duración (min)</Label>
                      <Select 
                        value={requestData.duration} 
                        onValueChange={(value) => setRequestData({ ...requestData, duration: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="45">45 minutos</SelectItem>
                          <SelectItem value="60">60 minutos</SelectItem>
                          <SelectItem value="90">90 minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsNewRequestDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar solicitudes..."
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
                <SelectItem value="all">Todas las solicitudes</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="ACCEPTED">Aceptadas</SelectItem>
                <SelectItem value="REJECTED">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {searchTerm || filterStatus !== 'all'
              ? 'No se encontraron solicitudes con los filtros aplicados'
              : 'No has enviado solicitudes de mentoría aún. ¡Envía tu primera solicitud!'}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(request => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {request.mentor.firstName} {request.mentor.lastName}
                    </CardTitle>
                    {request.mentor.expertise && (
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <BookOpen className="h-3 w-3" />
                        {request.mentor.expertise}
                      </CardDescription>
                    )}
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm"><strong>Tu mensaje:</strong></p>
                  <p className="text-sm text-muted-foreground mt-1">{request.message}</p>
                </div>

                {request.proposedSchedule && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(request.proposedSchedule.date), "d 'de' MMMM", { locale: es })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {request.proposedSchedule.time} ({request.proposedSchedule.duration} min)
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Enviada {format(new Date(request.createdAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })}</span>
                  {request.updatedAt !== request.createdAt && (
                    <span>Actualizada {format(new Date(request.updatedAt), "d 'de' MMMM", { locale: es })}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  {request.status === 'PENDING' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelRequest(request.id)}
                    >
                      Cancelar solicitud
                    </Button>
                  )}
                  
                  {request.status === 'ACCEPTED' && (
                    <Button
                      size="sm"
                      onClick={() => router.push('/mentee/sessions')}
                    >
                      Ver sesiones programadas
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}