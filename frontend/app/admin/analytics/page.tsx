'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserPlus,
  Clock,
  Activity,
  Award,
  BarChart3,
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import axios from '@/lib/api/axios'
import { useToast } from '@/hooks/use-toast'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface OverviewStats {
  users: {
    total: number
    mentors: number
    mentees: number
    activeLastMonth: number
  }
  sessions: {
    total: number
    completed: number
    completionRate: number
  }
  revenue: {
    total: number
    currency: string
  }
  ratings: {
    average: number
    scale: number
  }
}

interface TopMentor {
  mentor: {
    id: string
    firstName: string
    lastName: string
    email: string
    profilePicture?: string
    expertise?: string
  }
  stats: {
    totalSessions: number
    averageRating: number
    totalHours: number
    totalStudents: number
  }
}

export default function AdminAnalyticsPage() {
  const { toast } = useToast()
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<OverviewStats | null>(null)
  const [userGrowth, setUserGrowth] = useState<any>(null)
  const [sessionStats, setSessionStats] = useState<any>(null)
  const [revenueStats, setRevenueStats] = useState<any>(null)
  const [topMentors, setTopMentors] = useState<TopMentor[]>([])
  const [feedbackStats, setFeedbackStats] = useState<any>(null)
  const [activityHeatmap, setActivityHeatmap] = useState<any>(null)

  useEffect(() => {
    fetchAllData()
  }, [period])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [
        overviewRes,
        userGrowthRes,
        sessionStatsRes,
        revenueStatsRes,
        topMentorsRes,
        feedbackStatsRes,
        activityRes,
      ] = await Promise.all([
        axios.get('/analytics/overview'),
        axios.get(`/analytics/users?period=${period}`),
        axios.get(`/analytics/sessions?period=${period}`),
        axios.get(`/analytics/revenue?period=${period}`),
        axios.get('/analytics/mentors?limit=5'),
        axios.get('/analytics/feedback'),
        axios.get('/analytics/activity'),
      ])

      setOverview(overviewRes.data)
      setUserGrowth(userGrowthRes.data)
      setSessionStats(sessionStatsRes.data)
      setRevenueStats(revenueStatsRes.data)
      setTopMentors(topMentorsRes.data)
      setFeedbackStats(feedbackStatsRes.data)
      setActivityHeatmap(activityRes.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las estadísticas',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const userGrowthChartData = userGrowth ? {
    labels: userGrowth.totalGrowth.map((item: any) => item.date),
    datasets: [
      {
        label: 'Total de usuarios',
        data: userGrowth.totalGrowth.map((item: any) => item.count),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Mentores',
        data: userGrowth.mentorGrowth.map((item: any) => item.count),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Mentees',
        data: userGrowth.menteeGrowth.map((item: any) => item.count),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.5)',
        tension: 0.1,
      },
    ],
  } : null

  const sessionStatusChartData = sessionStats ? {
    labels: ['Programadas', 'Completadas', 'Canceladas', 'En Progreso'],
    datasets: [
      {
        data: [
          sessionStats.byStatus.scheduled,
          sessionStats.byStatus.completed,
          sessionStats.byStatus.cancelled,
          sessionStats.byStatus.inProgress,
        ],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 146, 60, 0.8)',
        ],
      },
    ],
  } : null

  const ratingDistributionData = feedbackStats ? {
    labels: ['1 ⭐', '2 ⭐', '3 ⭐', '4 ⭐', '5 ⭐'],
    datasets: [
      {
        label: 'Cantidad de calificaciones',
        data: [
          feedbackStats.ratingDistribution[1],
          feedbackStats.ratingDistribution[2],
          feedbackStats.ratingDistribution[3],
          feedbackStats.ratingDistribution[4],
          feedbackStats.ratingDistribution[5],
        ],
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
      },
    ],
  } : null

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Estadísticas y métricas de la plataforma</p>
        </div>
        <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última semana</SelectItem>
            <SelectItem value="month">Último mes</SelectItem>
            <SelectItem value="year">Último año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{overview?.users.total || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {overview?.users.activeLastMonth || 0} activos este mes
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Completadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{overview?.sessions.completed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {overview?.sessions.completionRate || 0}% tasa de completación
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(overview?.revenue.total || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% desde el mes pasado
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {overview?.ratings.average || 0} / {overview?.ratings.scale || 5}
                </div>
                <p className="text-xs text-muted-foreground">
                  Basado en {feedbackStats?.total || 0} reseñas
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Usuarios</CardTitle>
            <CardDescription>
              Nuevos registros por período
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !userGrowthChartData ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <Line
                data={userGrowthChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Session Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Sesiones</CardTitle>
            <CardDescription>
              Distribución por estado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !sessionStatusChartData ? (
              <Skeleton className="h-[300px]" />
            ) : (
              <Doughnut
                data={sessionStatusChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                    },
                  },
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Mentors */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Mentores</CardTitle>
          <CardDescription>
            Mentores con mejor desempeño
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {topMentors.map((item, index) => (
                <div
                  key={item.mentor.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={item.mentor.profilePicture} />
                        <AvatarFallback>
                          {item.mentor.firstName?.charAt(0)}
                          {item.mentor.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {index < 3 && (
                        <Badge
                          className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center"
                          variant={index === 0 ? 'default' : 'secondary'}
                        >
                          {index + 1}
                        </Badge>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {item.mentor.firstName} {item.mentor.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.mentor.expertise || 'Mentor'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-medium">{item.stats.totalSessions}</p>
                      <p className="text-xs text-muted-foreground">Sesiones</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {item.stats.averageRating}
                      </p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{item.stats.totalHours}h</p>
                      <p className="text-xs text-muted-foreground">Horas</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{item.stats.totalStudents}</p>
                      <p className="text-xs text-muted-foreground">Estudiantes</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Calificaciones</CardTitle>
          <CardDescription>
            Feedback de las sesiones completadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading || !ratingDistributionData ? (
            <Skeleton className="h-[300px]" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Bar
                  data={ratingDistributionData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Promedio General</span>
                    <span className="text-2xl font-bold flex items-center gap-1">
                      {feedbackStats?.averageRating || 0}
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Basado en {feedbackStats?.total || 0} calificaciones
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Tasa de Feedback</span>
                    <span className="text-2xl font-bold">
                      {feedbackStats?.completionRate || 0}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    De sesiones completadas con feedback
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Tendencia</span>
                    <Badge
                      variant={
                        feedbackStats?.recentTrend === 'improving'
                          ? 'default'
                          : feedbackStats?.recentTrend === 'declining'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {feedbackStats?.recentTrend === 'improving' && (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      )}
                      {feedbackStats?.recentTrend === 'declining' && (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {feedbackStats?.recentTrend === 'improving'
                        ? 'Mejorando'
                        : feedbackStats?.recentTrend === 'declining'
                        ? 'Declinando'
                        : 'Estable'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Últimos 30 días vs anteriores
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}