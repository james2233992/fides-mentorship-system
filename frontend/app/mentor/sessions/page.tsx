'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, Users, Video, MessageSquare, FileText, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import axios from '@/lib/api/axios'
import { RootState } from '@/store/store'
import { toast } from '@/hooks/use-toast'

interface Session {
  id: string
  title: string
  description?: string
  scheduledAt: string
  duration: number
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  meetingLink?: string
  mentee: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

const statusMap = {
  SCHEDULED: { label: 'Programada', variant: 'secondary' as const },
  IN_PROGRESS: { label: 'En Progreso', variant: 'default' as const },
  COMPLETED: { label: 'Completada', variant: 'outline' as const },
  CANCELLED: { label: 'Cancelada', variant: 'destructive' as const }
}

export default function MentorSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [showNotesDialog, setShowNotesDialog] = useState(false)
  const [notes, setNotes] = useState('')
  const [newStatus, setNewStatus] = useState<Session['status']>('SCHEDULED')
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  
  const { user } = useSelector((state: RootState) => state.auth)

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

  const updateSessionStatus = async () => {
    if (!selectedSession) return

    try {
      await axios.patch(`/sessions/${selectedSession.id}/status`, {
        status: newStatus
      })
      
      toast({
        title: 'Estado actualizado',
        description: 'El estado de la sesión ha sido actualizado correctamente'
      })
      
      setShowStatusDialog(false)
      fetchSessions()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la sesión',
        variant: 'destructive'
      })
    }
  }

  const saveNotes = async () => {
    if (!selectedSession) return

    try {
      await axios.patch(`/sessions/${selectedSession.id}`, {
        notes
      })
      
      toast({
        title: 'Notas guardadas',
        description: 'Las notas de la sesión han sido guardadas'
      })
      
      setShowNotesDialog(false)
      setNotes('')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las notas',
        variant: 'destructive'
      })
    }
  }

  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.scheduledAt)
    const now = new Date()
    
    if (filter === 'upcoming') {
      return sessionDate >= now && session.status !== 'CANCELLED'
    } else if (filter === 'past') {
      return sessionDate < now || session.status === 'COMPLETED'
    }
    return true
  })

  const upcomingSessions = sessions.filter(
    s => new Date(s.scheduledAt) >= new Date() && s.status === 'SCHEDULED'
  ).length

  const completedSessions = sessions.filter(
    s => s.status === 'COMPLETED'
  ).length

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              En total este mes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sesiones programadas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sesiones realizadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y lista de sesiones */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Sesiones de Mentoría</CardTitle>
          <CardDescription>
            Gestiona tus sesiones programadas y revisa el historial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(value) => setFilter(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="upcoming">Próximas</TabsTrigger>
              <TabsTrigger value="past">Pasadas</TabsTrigger>
            </TabsList>
            
            <TabsContent value={filter} className="space-y-4">
              {filteredSessions.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No hay sesiones para mostrar en esta categoría
                  </AlertDescription>
                </Alert>
              ) : (
                filteredSessions.map(session => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{session.title}</h3>
                            <Badge variant={statusMap[session.status].variant}>
                              {statusMap[session.status].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {session.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {session.mentee.firstName} {session.mentee.lastName}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(session.scheduledAt), "dd 'de' MMMM, yyyy", { locale: es })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(session.scheduledAt), 'HH:mm')} - {session.duration} min
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {session.status === 'SCHEDULED' && session.meetingLink && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(session.meetingLink, '_blank')}
                            >
                              <Video className="h-4 w-4 mr-1" />
                              Unirse
                            </Button>
                          )}
                          {session.status === 'SCHEDULED' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedSession(session)
                                setNewStatus(session.status)
                                setShowStatusDialog(true)
                              }}
                            >
                              Cambiar Estado
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedSession(session)
                              setShowNotesDialog(true)
                            }}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Notas
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog para cambiar estado */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Sesión</DialogTitle>
            <DialogDescription>
              Actualiza el estado de la sesión "{selectedSession?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Nuevo Estado</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as Session['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Programada</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                  <SelectItem value="COMPLETED">Completada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={updateSessionStatus}>
              Actualizar Estado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para notas */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notas de la Sesión</DialogTitle>
            <DialogDescription>
              Agrega notas y observaciones sobre la sesión
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escribe tus notas aquí..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={saveNotes}>
              Guardar Notas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}