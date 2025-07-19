'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar as CalendarIcon, Clock, User, MapPin, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, addMonths, subMonths, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import axios from '@/lib/api/axios'
import { toast } from '@/hooks/use-toast'

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
  }
  mentee: {
    id: string
    firstName: string
    lastName: string
  }
  meetingLink?: string
  notes?: string
}

export default function AdminCalendarPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  useEffect(() => {
    fetchSessions()
  }, [currentDate])

  const fetchSessions = async () => {
    try {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      
      const response = await axios.get('/sessions', {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }
      })
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

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const getSessionsForDay = (day: Date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.scheduledAt)
      return (
        sessionDate.getDate() === day.getDate() &&
        sessionDate.getMonth() === day.getMonth() &&
        sessionDate.getFullYear() === day.getFullYear()
      )
    })
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })
    
    // Add padding days from previous month
    const startDayOfWeek = getDay(start)
    const previousMonthDays = []
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      previousMonthDays.push(new Date(start.getFullYear(), start.getMonth(), -i))
    }
    
    // Add padding days from next month
    const endDayOfWeek = getDay(end)
    const nextMonthDays = []
    for (let i = 1; i < 7 - endDayOfWeek; i++) {
      nextMonthDays.push(new Date(end.getFullYear(), end.getMonth() + 1, i))
    }
    
    return [...previousMonthDays, ...days, ...nextMonthDays]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-500'
      case 'IN_PROGRESS':
        return 'bg-yellow-500'
      case 'COMPLETED':
        return 'bg-green-500'
      case 'CANCELLED':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session)
    setIsDetailsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Calendario de Mentorías</h2>
          <p className="text-muted-foreground">
            Vista general de todas las sesiones programadas
          </p>
        </div>
        <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Vista Mensual</SelectItem>
            <SelectItem value="week" disabled>Vista Semanal (Próximamente)</SelectItem>
            <SelectItem value="day" disabled>Vista Diaria (Próximamente)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {getDaysInMonth().map((day, index) => {
              const dayOfMonth = day.getDate()
              const daysSessions = getSessionsForDay(day)
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isDayToday = isToday(day)
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border-r border-b ${
                    !isCurrentMonth ? 'bg-muted/50' : ''
                  } ${isDayToday ? 'bg-primary/5' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    !isCurrentMonth ? 'text-muted-foreground' : ''
                  } ${isDayToday ? 'text-primary' : ''}`}>
                    {dayOfMonth}
                  </div>
                  <div className="space-y-1">
                    {daysSessions.slice(0, 3).map(session => (
                      <div
                        key={session.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getStatusColor(session.status)} text-white`}
                        onClick={() => handleSessionClick(session)}
                      >
                        <div className="truncate">
                          {format(new Date(session.scheduledAt), 'HH:mm')} - {session.title}
                        </div>
                      </div>
                    ))}
                    {daysSessions.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{daysSessions.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              En {format(currentDate, 'MMMM', { locale: es })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programadas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'SCHEDULED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Próximas sesiones
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'COMPLETED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.status === 'CANCELLED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Session Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Sesión</DialogTitle>
            <DialogDescription>
              Información completa de la sesión de mentoría
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{selectedSession.title}</h3>
                <Badge className={`${getStatusColor(selectedSession.status)} text-white`}>
                  {selectedSession.status === 'SCHEDULED' && 'Programada'}
                  {selectedSession.status === 'IN_PROGRESS' && 'En Progreso'}
                  {selectedSession.status === 'COMPLETED' && 'Completada'}
                  {selectedSession.status === 'CANCELLED' && 'Cancelada'}
                </Badge>
              </div>
              
              <div className="grid gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>Mentor:</strong> {selectedSession.mentor.firstName} {selectedSession.mentor.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>Mentee:</strong> {selectedSession.mentee.firstName} {selectedSession.mentee.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>Fecha:</strong> {format(new Date(selectedSession.scheduledAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>Duración:</strong> {selectedSession.duration} minutos
                  </span>
                </div>
              </div>

              {selectedSession.notes && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm"><strong>Notas:</strong></p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedSession.notes}</p>
                </div>
              )}

              {selectedSession.meetingLink && (
                <Button className="w-full" onClick={() => window.open(selectedSession.meetingLink, '_blank')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver enlace de reunión
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}