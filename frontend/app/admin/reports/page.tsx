'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Download, 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock, 
  BarChart3, 
  FileText,
  UserCheck,
  UserX,
  Activity
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import axios from '@/lib/api/axios'
import { toast } from '@/hooks/use-toast'

interface Report {
  totalUsers: number
  totalMentors: number
  totalMentees: number
  totalSessions: number
  completedSessions: number
  cancelledSessions: number
  averageSessionDuration: number
  mostActiveMentors: Array<{
    id: string
    name: string
    sessionCount: number
  }>
  sessionsByMonth: Array<{
    month: string
    count: number
  }>
  sessionsByStatus: {
    scheduled: number
    inProgress: number
    completed: number
    cancelled: number
  }
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<Report | null>(null)
  const [timeRange, setTimeRange] = useState('month')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [timeRange])

  const fetchReport = async () => {
    try {
      const response = await axios.get(`/reports/general?range=${timeRange}`)
      setReport(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los reportes',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async (type: string) => {
    setGenerating(true)
    try {
      const response = await axios.get(`/reports/download/${type}?range=${timeRange}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reporte-${type}-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast({
        title: 'Reporte generado',
        description: 'El reporte ha sido descargado exitosamente'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo generar el reporte',
        variant: 'destructive'
      })
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reportes y Análisis</h2>
          <p className="text-muted-foreground">
            Visualiza y exporta datos del sistema
          </p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {report?.totalMentors || 0} mentores, {report?.totalMentees || 0} mentees
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sesiones</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report?.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">
              En el período seleccionado
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Completado</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report?.totalSessions 
                ? Math.round((report.completedSessions / report.totalSessions) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {report?.completedSessions || 0} completadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duración Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report?.averageSessionDuration || 0} min
            </div>
            <p className="text-xs text-muted-foreground">
              Por sesión
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de reportes */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="mentors">Mentores</TabsTrigger>
          <TabsTrigger value="sessions">Sesiones</TabsTrigger>
          <TabsTrigger value="export">Exportar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Estado de sesiones */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Sesiones</CardTitle>
              <CardDescription>
                Distribución de sesiones por estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm">Completadas</span>
                  </div>
                  <span className="font-medium">{report?.sessionsByStatus.completed || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Programadas</span>
                  </div>
                  <span className="font-medium">{report?.sessionsByStatus.scheduled || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">En Progreso</span>
                  </div>
                  <span className="font-medium">{report?.sessionsByStatus.inProgress || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">Canceladas</span>
                  </div>
                  <span className="font-medium">{report?.sessionsByStatus.cancelled || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sesiones por mes */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Sesiones</CardTitle>
              <CardDescription>
                Número de sesiones por mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report?.sessionsByMonth.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{item.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ 
                            width: `${(item.count / Math.max(...report.sessionsByMonth.map(m => m.count))) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mentores Más Activos</CardTitle>
              <CardDescription>
                Top 10 mentores por número de sesiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report?.mostActiveMentors.map((mentor, index) => (
                  <div key={mentor.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="font-medium">{mentor.name}</span>
                    </div>
                    <Badge variant="secondary">{mentor.sessionCount} sesiones</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sesiones por Día de la Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Análisis de preferencias de horarios próximamente
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Duración de Sesiones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Distribución de duraciones próximamente
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exportar Reportes</CardTitle>
              <CardDescription>
                Descarga reportes detallados en formato PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Reporte General
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Incluye todas las estadísticas y métricas del sistema
                  </p>
                  <Button 
                    onClick={() => generatePDF('general')} 
                    disabled={generating}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {generating ? 'Generando...' : 'Descargar PDF'}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Reporte de Usuarios
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Detalle de mentores, mentees y su actividad
                  </p>
                  <Button 
                    onClick={() => generatePDF('users')} 
                    disabled={generating}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {generating ? 'Generando...' : 'Descargar PDF'}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Reporte de Sesiones
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Análisis detallado de todas las sesiones
                  </p>
                  <Button 
                    onClick={() => generatePDF('sessions')} 
                    disabled={generating}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {generating ? 'Generando...' : 'Descargar PDF'}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Reporte de Rendimiento
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    KPIs y métricas de rendimiento del sistema
                  </p>
                  <Button 
                    onClick={() => generatePDF('performance')} 
                    disabled={generating}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {generating ? 'Generando...' : 'Descargar PDF'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}