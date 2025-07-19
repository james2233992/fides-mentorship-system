'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, Star, Calendar, Clock, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import axios from '@/lib/api/axios'

interface Session {
  id: string
  title: string
  scheduledAt: string
  duration: number
  completedAt: string
  mentor: {
    id: string
    firstName: string
    lastName: string
  }
  mentee: {
    id: string
    firstName: string
    lastName: string
  }
}

interface PendingFeedbackCardProps {
  userId: string
  userRole: string
}

export function PendingFeedbackCard({ userId, userRole }: PendingFeedbackCardProps) {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingSessions()
  }, [])

  const fetchPendingSessions = async () => {
    try {
      const response = await axios.get('/feedback/pending')
      setSessions(response.data)
    } catch (error) {
      console.error('Error fetching pending feedback sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (sessions.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Feedback Pendiente
        </CardTitle>
        <CardDescription>
          Tienes {sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'} esperando tu feedback
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.slice(0, 3).map((session) => {
            const otherUser = userRole === 'MENTOR' ? session.mentee : session.mentor
            const userType = userRole === 'MENTOR' ? 'Estudiante' : 'Mentor'

            return (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/sessions/${session.id}/feedback`)}
              >
                <div className="space-y-1">
                  <p className="font-medium text-sm">{session.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {userType}: {otherUser.firstName} {otherUser.lastName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(session.completedAt), "d MMM", { locale: es })}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            )
          })}
        </div>

        {sessions.length > 3 && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/sessions?tab=feedback')}
            >
              Ver todas ({sessions.length})
            </Button>
          </div>
        )}

        <Alert className="mt-4">
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            Tu feedback es valioso para mejorar la experiencia de mentoría
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}