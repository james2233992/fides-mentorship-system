'use client'

import { useState, useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Clock, Check, X, MessageSquare, User, Mail, MapPin, Briefcase } from 'lucide-react'
import axiosInstance from '@/lib/api/axios'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SessionRequest {
  id: string
  title: string
  description: string
  requestedDate: string
  duration: number
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  createdAt: string
  mentee: {
    id: string
    firstName: string
    lastName: string
    email: string
    profilePicture: string
    bio?: string
    location?: string
    expertise?: string
  }
  message?: string
}

export default function RequestsPage() {
  const { user } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const { toast } = useToast()
  const [requests, setRequests] = useState<SessionRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    if (!user || user.role !== 'mentor') {
      router.push('/dashboard')
    } else {
      fetchRequests()
    }
  }, [user, router])

  const fetchRequests = async () => {
    try {
      const response = await axiosInstance.get('/sessions/requests')
      setRequests(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las solicitudes',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (requestId: string) => {
    try {
      await axiosInstance.post(`/sessions/requests/${requestId}/accept`)
      toast({
        title: 'Solicitud aceptada',
        description: 'Se ha confirmado la sesión de mentoría',
      })
      fetchRequests()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo aceptar la solicitud',
        variant: 'destructive',
      })
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      await axiosInstance.post(`/sessions/requests/${requestId}/reject`)
      toast({
        title: 'Solicitud rechazada',
        description: 'Se ha rechazado la solicitud de sesión',
      })
      fetchRequests()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo rechazar la solicitud',
        variant: 'destructive',
      })
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const acceptedRequests = requests.filter(r => r.status === 'accepted')
  const rejectedRequests = requests.filter(r => r.status === 'rejected' || r.status === 'cancelled')

  const RequestCard = ({ request }: { request: SessionRequest }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={request.mentee.profilePicture} />
              <AvatarFallback>
                {request.mentee.firstName?.charAt(0)}
                {request.mentee.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {request.mentee.firstName} {request.mentee.lastName}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-3 w-3" />
                {request.mentee.email}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={
              request.status === 'pending' ? 'secondary' :
              request.status === 'accepted' ? 'default' :
              'destructive'
            }
          >
            {request.status === 'pending' ? 'Pendiente' :
             request.status === 'accepted' ? 'Aceptada' :
             request.status === 'rejected' ? 'Rechazada' : 'Cancelada'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-1">{request.title}</h4>
          <p className="text-sm text-muted-foreground">{request.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(new Date(request.requestedDate), "d 'de' MMMM, yyyy", { locale: es })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{request.duration} minutos</span>
          </div>
        </div>

        {request.mentee.bio && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Sobre el aprendiz:</p>
            <p className="text-sm text-muted-foreground">{request.mentee.bio}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-sm">
          {request.mentee.location && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {request.mentee.location}
            </div>
          )}
          {request.mentee.expertise && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Briefcase className="h-3 w-3" />
              {request.mentee.expertise}
            </div>
          )}
        </div>

        {request.message && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm italic">"{request.message}"</p>
          </div>
        )}
      </CardContent>
      {request.status === 'pending' && (
        <CardFooter className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleAccept(request.id)}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            Aceptar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReject(request.id)}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Rechazar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/messages?userId=${request.mentee.id}`)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Solicitudes de Mentoría</h1>
        <p className="text-muted-foreground">Gestiona las solicitudes de sesiones de tus aprendices</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">Esperando respuesta</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aceptadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acceptedRequests.length}</div>
            <p className="text-xs text-muted-foreground">Sesiones confirmadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedRequests.length}</div>
            <p className="text-xs text-muted-foreground">No procesadas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pendientes ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Aceptadas ({acceptedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rechazadas ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tienes solicitudes pendientes</p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4 mt-6">
          {acceptedRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay solicitudes aceptadas</p>
              </CardContent>
            </Card>
          ) : (
            acceptedRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-6">
          {rejectedRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <X className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay solicitudes rechazadas</p>
              </CardContent>
            </Card>
          ) : (
            rejectedRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}