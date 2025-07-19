'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/store/hooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAppSelector((state) => state.auth)
  const [stats, setStats] = useState({
    users: { total: 0, admins: 0, mentors: 0, mentees: 0 },
    sessions: { active: 0, today: 0, week: 0, month: 0 },
    notifications: { unread: 0 },
  })

  useEffect(() => {
    if (!user || (user.role?.toUpperCase() !== 'ADMIN')) {
      router.push('/login')
    } else {
      fetchStats()
    }
  }, [user, router])

  const fetchStats = async () => {
    try {
      // Fetch users stats
      const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      if (usersResponse.ok) {
        const users = await usersResponse.json()
        const userStats = {
          total: users.length,
          admins: users.filter((u: any) => u.role === 'admin').length,
          mentors: users.filter((u: any) => u.role === 'mentor').length,
          mentees: users.filter((u: any) => u.role === 'mentee').length,
        }
        setStats(prev => ({ ...prev, users: userStats }))
      }

      // Fetch sessions stats
      const sessionsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      if (sessionsResponse.ok) {
        const sessions = await sessionsResponse.json()
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        
        const sessionStats = {
          active: sessions.filter((s: any) => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS').length,
          today: sessions.filter((s: any) => new Date(s.scheduledAt) >= today).length,
          week: sessions.filter((s: any) => new Date(s.scheduledAt) >= weekAgo).length,
          month: sessions.filter((s: any) => new Date(s.scheduledAt) >= monthAgo).length,
        }
        setStats(prev => ({ ...prev, sessions: sessionStats }))
      }

      // Fetch notifications stats
      const notificationsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      
      if (notificationsResponse.ok) {
        const data = await notificationsResponse.json()
        setStats(prev => ({ ...prev, notifications: { unread: data.count } }))
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar las estadísticas',
        variant: 'destructive',
      })
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>No hay usuario autenticado</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Ir a Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      <p className="text-gray-600 mb-8">Bienvenido, {user.name || user.email}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Gestionar usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">Total: {stats.users.total}</p>
              <div className="text-sm text-gray-600">
                <p>Administradores: {stats.users.admins}</p>
                <p>Mentores: {stats.users.mentors}</p>
                <p>Estudiantes: {stats.users.mentees}</p>
              </div>
              <Button className="w-full mt-4" onClick={() => router.push('/admin/users')}>Gestionar Usuarios</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mentorías</CardTitle>
            <CardDescription>Sesiones programadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">Hoy: {stats.sessions.today}</p>
              <div className="text-sm text-gray-600">
                <p>Esta semana: {stats.sessions.week}</p>
                <p>Este mes: {stats.sessions.month}</p>
              </div>
              <Button className="w-full mt-4" onClick={() => router.push('/admin/calendar')}>Ver Calendario</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reportes</CardTitle>
            <CardDescription>Análisis y estadísticas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Genera reportes de uso, asistencia y progreso
              </p>
              <Button className="w-full mt-4" onClick={() => router.push('/admin/reports')}>Generar Reporte</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Ajustes del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Configura horarios, notificaciones y más
              </p>
              <Button className="w-full mt-4" onClick={() => router.push('/admin/settings')}>Ir a Configuración</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sesiones</CardTitle>
            <CardDescription>Gestión de sesiones de mentoría</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">Activas: {stats.sessions.active}</p>
              <p className="text-sm text-gray-600">
                Administra todas las sesiones del sistema
              </p>
              <Button className="w-full mt-4" onClick={() => router.push('/admin/sessions')}>
                Gestionar Sesiones
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Métricas y estadísticas detalladas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Dashboard completo con métricas de usuarios, sesiones, ingresos y más
              </p>
              <Button className="w-full mt-4" onClick={() => router.push('/admin/analytics')}>
                Ver Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>Comunicaciones del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">Sin leer: {stats.notifications.unread}</p>
              <Button className="w-full mt-4" onClick={() => router.push('/admin/notifications')}>Ver Notificaciones</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ayuda</CardTitle>
            <CardDescription>Soporte y documentación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Accede a guías y contacta soporte
              </p>
              <Button variant="outline" className="w-full mt-4" onClick={() => window.open('/docs', '_blank')}>Ver Documentación</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}