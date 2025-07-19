'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft } from 'lucide-react'
import { useToast } from '@/components/hooks/use-toast'

const sessionSchema = z.object({
  mentorId: z.string().min(1, 'Debes seleccionar un mentor'),
  menteeId: z.string().min(1, 'Debes seleccionar un estudiante'),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  scheduledAt: z.string().min(1, 'Debes seleccionar una fecha y hora'),
  duration: z.number().min(15, 'La duración mínima es 15 minutos').max(180, 'La duración máxima es 180 minutos'),
})

type SessionFormData = z.infer<typeof sessionSchema>

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export default function NewSessionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [mentors, setMentors] = useState<User[]>([])
  const [mentees, setMentees] = useState<User[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      duration: 60,
    },
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const users = await response.json()
        setMentors(users.filter((u: User) => u.role === 'mentor' || u.role === 'admin'))
        setMentees(users.filter((u: User) => u.role === 'mentee'))
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar usuarios',
        variant: 'destructive',
      })
    }
  }

  const onSubmit = async (data: SessionFormData) => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...data,
          duration: Number(data.duration),
        }),
      })

      if (response.ok) {
        toast({
          title: 'Sesión creada',
          description: 'La sesión ha sido programada exitosamente',
        })
        router.push('/admin/sessions')
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'No se pudo crear la sesión',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al crear la sesión',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Get minimum date (today)
  const today = new Date()
  const minDate = today.toISOString().slice(0, 16)

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/sessions')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Programar Nueva Sesión</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Detalles de la Sesión</CardTitle>
          <CardDescription>
            Programa una nueva sesión de mentoría
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la sesión</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Introducción a React"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mentorId">Mentor</Label>
                <Select
                  onValueChange={(value) => setValue('mentorId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.firstName} {mentor.lastName} ({mentor.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mentorId && (
                  <p className="text-sm text-red-500">{errors.mentorId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="menteeId">Estudiante</Label>
                <Select
                  onValueChange={(value) => setValue('menteeId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {mentees.map((mentee) => (
                      <SelectItem key={mentee.id} value={mentee.id}>
                        {mentee.firstName} {mentee.lastName} ({mentee.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.menteeId && (
                  <p className="text-sm text-red-500">{errors.menteeId.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripción de los temas a tratar en la sesión..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Fecha y hora</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  {...register('scheduledAt')}
                  min={minDate}
                />
                {errors.scheduledAt && (
                  <p className="text-sm text-red-500">{errors.scheduledAt.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  min="15"
                  max="180"
                  step="15"
                />
                {errors.duration && (
                  <p className="text-sm text-red-500">{errors.duration.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Programar Sesión'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/sessions')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}