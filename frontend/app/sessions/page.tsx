'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Video, MessageSquare, Star, FileText, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import axiosInstance from '@/lib/api/axios'

interface Session {
  id: string
  title: string
  description: string
  scheduledAt: string
  duration: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  meetingUrl?: string
  mentor: {
    id: string
    firstName: string
    lastName: string
    email: string
    profilePicture?: string
    expertise?: string
  }
  mentee: {
    id: string
    firstName: string
    lastName: string
    email: string
    profilePicture?: string
  }
  feedback?: {
    rating: number
    comment: string
  }
}

export default function SessionsPage() {
  const { user } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    } else {
      fetchSessions()
    }
  }, [user, router])

  const fetchSessions = async () => {
    try {
      const response = await axiosInstance.get('/sessions')
      setSessions(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las sesiones',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinSession = (session: Session) => {
    if (session.meetingUrl) {
      window.open(session.meetingUrl, '_blank')
    } else {
      toast({
        title: 'URL no disponible',
        description: 'El enlace de la reunión aún no está disponible',
        variant: 'destructive',
      })
    }
  }

  const handleCancelSession = async (sessionId: string) => {
    try {
      await axiosInstance.patch(`/sessions/${sessionId}/cancel`)
      toast({
        title: 'Sesión cancelada',
        description: 'La sesión ha sido cancelada exitosamente',
      })
      fetchSessions()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cancelar la sesión',
        variant: 'destructive',
      })
    }
  }

  const handleProvideFeedback = (sessionId: string) => {
    router.push(`/sessions/${sessionId}/feedback`)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { variant: 'secondary' as const, label: 'Programada' },
      in_progress: { variant: 'default' as const, label: 'En curso' },
      completed: { variant: 'outline' as const, label: 'Completada' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelada' },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const isSessionUpcoming = (session: Session) => {
    return new Date(session.scheduledAt) > new Date() && session.status === 'scheduled'
  }

  const canJoinSession = (session: Session) => {
    const sessionTime = new Date(session.scheduledAt)
    const now = new Date()
    const fifteenMinutesBefore = new Date(sessionTime.getTime() - 15 * 60 * 1000)
    const oneHourAfter = new Date(sessionTime.getTime() + 60 * 60 * 1000)
    
    return now >= fifteenMinutesBefore && now <= oneHourAfter && session.status !== 'cancelled'
  }

  const upcomingSessions = sessions.filter(s => isSessionUpcoming(s))
  const pastSessions = sessions.filter(s => !isSessionUpcoming(s))

  const SessionCard = ({ session }: { session: Session }) => {
    const otherUser = user?.role === 'mentor' ? session.mentee : session.mentor

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.profilePicture} />
                <AvatarFallback>
                  {otherUser.firstName?.charAt(0)}
                  {otherUser.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{session.title}</CardTitle>
                <CardDescription>
                  con {otherUser.firstName} {otherUser.lastName}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge(session.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{session.description}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(session.scheduledAt), "d 'de' MMMM, yyyy", { locale: es })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(session.scheduledAt), 'HH:mm')} - {session.duration} min
              </span>
            </div>
          </div>

          {session.mentor.expertise && user?.role === 'mentee' && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Expertise:</span> {session.mentor.expertise}
            </div>
          )}

          {session.feedback && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{session.feedback.rating}/5</span>
              </div>
              <p className="text-sm text-muted-foreground">{session.feedback.comment}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          {canJoinSession(session) && (
            <Button
              size="sm"
              onClick={() => handleJoinSession(session)}
            >
              <Video className="h-4 w-4 mr-2" />
              Unirse
            </Button>
          )}
          {isSessionUpcoming(session) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCancelSession(session.id)}
            >
              Cancelar
            </Button>
          )}
          {session.status === 'completed' && !session.feedback && user?.role === 'mentee' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleProvideFeedback(session.id)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Dejar feedback
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/messages?userId=${otherUser.id}`)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mis Sesiones</h1>
        <p className="text-muted-foreground">
          {user?.role === 'mentor' 
            ? 'Gestiona tus sesiones de mentoría' 
            : 'Gestiona tus sesiones con mentores'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Próximas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions.length}</div>
            <p className="text-xs text-muted-foreground">Sesiones programadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pastSessions.filter(s => s.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Sesiones finalizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">Todas las sesiones</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">
            Próximas ({upcomingSessions.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Pasadas ({pastSessions.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Todas ({sessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {upcomingSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tienes sesiones próximas</p>
                {user?.role === 'mentee' && (
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/mentors')}
                  >
                    Buscar mentores
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            upcomingSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-6">
          {pastSessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tienes sesiones pasadas</p>
              </CardContent>
            </Card>
          ) : (
            pastSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-6">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tienes sesiones</p>
                {user?.role === 'mentee' && (
                  <Button
                    className="mt-4"
                    onClick={() => router.push('/mentors')}
                  >
                    Buscar mentores
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            sessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}