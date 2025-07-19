'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, TrendingUp, Settings, BookOpen, MessageSquare } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { useToast } from '@/components/hooks/use-toast'
import { PendingFeedbackCard } from '@/components/feedback/pending-feedback-card'

export default function MentorDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAppSelector((state) => state.auth)
  const { sessions, requests } = useAppSelector((state) => state.mentorship)

  useEffect(() => {
    if (!user || (user.role !== 'mentor' && user.role !== 'admin')) {
      router.push('/login')
    }
  }, [user, router])

  const upcomingSessions = sessions.filter(
    (s) => new Date(s.scheduledAt) > new Date() && s.status === 'scheduled'
  )
  const pendingRequests = requests.filter((r) => r.status === 'pending')

  const handleAcceptRequest = (requestId: string) => {
    toast({
      title: 'Próximamente',
      description: 'La funcionalidad de aceptar solicitudes estará disponible pronto',
    })
  }

  const handleDeclineRequest = (requestId: string) => {
    toast({
      title: 'Próximamente',
      description: 'La funcionalidad de rechazar solicitudes estará disponible pronto',
    })
  }

  const handleViewSessionDetails = (sessionId: string) => {
    toast({
      title: 'Próximamente',
      description: 'Los detalles de la sesión estarán disponibles pronto',
    })
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || user?.email}!</h1>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your mentorship activities
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Upcoming Sessions
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingSessions.length}</div>
              <p className="text-xs text-muted-foreground">
                Sessions scheduled this week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Requests
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests.length}</div>
              <p className="text-xs text-muted-foreground">
                Mentees waiting for response
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
              <p className="text-xs text-muted-foreground">
                All-time sessions conducted
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Impact Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-muted-foreground">
                Average mentee rating
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
              <CardDescription>
                Your scheduled mentorship sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming sessions scheduled
                </p>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          with {session.menteeName} •{' '}
                          {new Date(session.scheduledAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSessionDetails(session.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>
                New mentorship requests from mentees
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pending requests
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{request.menteeName}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.message.substring(0, 50)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeclineRequest(request.id)}
                        >
                          Decline
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          Accept
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feedback pendiente */}
        <div className="mt-8">
          {user && <PendingFeedbackCard userId={user.id} userRole="MENTOR" />}
        </div>

        <div className="mt-8 flex gap-4 flex-wrap">
          <Button onClick={() => router.push('/mentor/sessions')}>
            <Calendar className="h-4 w-4 mr-2" />
            Gestionar Sesiones
          </Button>
          <Button variant="outline" onClick={() => router.push('/messages')}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Mensajes
          </Button>
          <Button variant="outline" onClick={() => router.push('/mentor/availability')}>
            <Clock className="h-4 w-4 mr-2" />
            Configurar Disponibilidad
          </Button>
          <Button variant="outline" onClick={() => router.push('/resources')}>
            <BookOpen className="h-4 w-4 mr-2" />
            Recursos de Aprendizaje
          </Button>
          <Button variant="outline" onClick={() => router.push('/mentor/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
    </div>
  )
}