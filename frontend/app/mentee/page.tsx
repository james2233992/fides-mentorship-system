'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAppSelector } from '@/store/hooks'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/hooks/use-toast'
import { Calendar, Clock, User, BookOpen, MessageSquare, TrendingUp, AlertCircle, Target } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import axios from '@/lib/api/axios'
import { PendingFeedbackCard } from '@/components/feedback/pending-feedback-card'

interface Session {
  id: string
  title: string
  scheduledAt: string
  duration: number
  status: string
  mentor: {
    id: string
    firstName: string
    lastName: string
    expertise?: string
  }
}

interface Stats {
  totalSessions: number
  completedSessions: number
  upcomingSessions: number
  totalHours: number
}

export default function MenteeDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAppSelector((state) => state.auth)
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    totalHours: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'mentee') {
      router.push('/login')
    } else {
      fetchData()
    }
  }, [user, router])

  const fetchData = async () => {
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        axios.get('/sessions'),
        axios.get('/users/stats')
      ])
      
      setSessions(sessionsRes.data.slice(0, 3)) // Mostrar solo las próximas 3
      setStats(statsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNextSession = () => {
    return sessions.find(s => 
      s.status === 'SCHEDULED' && 
      new Date(s.scheduledAt) > new Date()
    )
  }

  if (!user) return null

  const nextSession = getNextSession()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">¡Hola, {user.firstName || user.email.split('@')[0]}! 👋</h1>
        <p className="text-muted-foreground mt-2">
          Este es tu espacio personal para gestionar tu desarrollo profesional
        </p>
      </div>

      {/* Próxima sesión destacada */}
      {nextSession && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Próxima sesión:</strong> {nextSession.title} con {nextSession.mentor.firstName} {nextSession.mentor.lastName}
                <br />
                <span className="text-sm">
                  {format(new Date(nextSession.scheduledAt), "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })}
                </span>
              </div>
              <Button size="sm" variant="outline">
                Ver detalles
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  En tu historial
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.completedSessions}</div>
                <p className="text-xs text-muted-foreground">
                  Este mes
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
                <p className="text-xs text-muted-foreground">
                  Programadas
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Totales</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalHours}</div>
                <p className="text-xs text-muted-foreground">
                  De aprendizaje
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Buscar Mentores
            </CardTitle>
            <CardDescription>
              Encuentra el mentor ideal para tu desarrollo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push('/mentors')}>
              Explorar Mentores
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mis Sesiones
            </CardTitle>
            <CardDescription>
              Gestiona tus sesiones programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => router.push('/mentee/sessions')}
            >
              Ver Todas las Sesiones
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mensajes
            </CardTitle>
            <CardDescription>
              Comunícate con tus mentores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => router.push('/messages')}
            >
              Ver Mensajes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Solicitudes
            </CardTitle>
            <CardDescription>
              Envía solicitudes de mentoría
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => router.push('/mentee/requests')}
            >
              Mis Solicitudes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recursos
            </CardTitle>
            <CardDescription>
              Materiales de aprendizaje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => router.push('/resources')}
            >
              Ver Recursos
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila de acciones */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Mis Metas
            </CardTitle>
            <CardDescription>
              Establece y rastrea tus objetivos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => router.push('/goals')}
            >
              Ver Metas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feedback pendiente */}
      {user && <PendingFeedbackCard userId={user.id} userRole="MENTEE" />}

      {/* Próximas sesiones */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Sesiones</CardTitle>
          <CardDescription>
            Tus mentorías programadas para los próximos días
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : sessions.filter(s => s.status === 'SCHEDULED').length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No tienes sesiones programadas. ¡Busca un mentor y solicita tu primera sesión!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {sessions
                .filter(s => s.status === 'SCHEDULED')
                .map(session => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{session.title}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {session.mentor.firstName} {session.mentor.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(session.scheduledAt), "d MMM", { locale: es })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(session.scheduledAt), "HH:mm")}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary">Programada</Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}