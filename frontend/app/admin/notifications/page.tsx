'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, Check, CheckCheck, Trash2, Calendar, User } from 'lucide-react'
import { useToast } from '@/components/hooks/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  readAt?: string
  createdAt: string
  sender?: {
    id: string
    firstName: string
    lastName: string
  }
  session?: {
    id: string
    title: string
    scheduledAt: string
  }
}

export default function NotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las notificaciones',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar las notificaciones',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })))
        setUnreadCount(0)
        toast({
          title: 'Notificaciones marcadas como leídas',
          description: 'Todas las notificaciones han sido marcadas como leídas',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al marcar las notificaciones',
        variant: 'destructive',
      })
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const notification = notifications.find(n => n.id === notificationId)
        if (notification && !notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        setNotifications(notifications.filter(n => n.id !== notificationId))
        toast({
          title: 'Notificación eliminada',
          description: 'La notificación ha sido eliminada',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al eliminar la notificación',
        variant: 'destructive',
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'SESSION_SCHEDULED':
      case 'SESSION_REMINDER':
      case 'SESSION_CANCELLED':
      case 'SESSION_RESCHEDULED':
      case 'SESSION_COMPLETED':
        return <Calendar className="h-5 w-5" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationBadge = (type: string) => {
    const badges: Record<string, { label: string; variant: any }> = {
      SESSION_SCHEDULED: { label: 'Sesión Programada', variant: 'default' },
      SESSION_REMINDER: { label: 'Recordatorio', variant: 'secondary' },
      SESSION_CANCELLED: { label: 'Cancelada', variant: 'destructive' },
      SESSION_COMPLETED: { label: 'Completada', variant: 'default' },
      SYSTEM_ANNOUNCEMENT: { label: 'Anuncio', variant: 'outline' },
    }

    const badge = badges[type] || { label: type, variant: 'default' }
    return <Badge variant={badge.variant}>{badge.label}</Badge>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <p className="text-gray-600 mt-2">
            {unreadCount > 0 ? `Tienes ${unreadCount} notificaciones sin leer` : 'Todas las notificaciones están leídas'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Cargando notificaciones...</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tienes notificaciones</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <ScrollArea className="h-[600px]">
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${
                      !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{notification.title}</p>
                            {getNotificationBadge(notification.type)}
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          {notification.sender && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                              <User className="h-3 w-3" />
                              <span>{notification.sender.firstName} {notification.sender.lastName}</span>
                            </div>
                          )}
                          {notification.session && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {notification.session.title} - {format(new Date(notification.session.scheduledAt), 'PPP', { locale: es })}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {notification.isRead && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {format(new Date(notification.createdAt), "PPP 'a las' p", { locale: es })}
                        {notification.readAt && (
                          <span> • Leída {format(new Date(notification.readAt), "PPP 'a las' p", { locale: es })}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}