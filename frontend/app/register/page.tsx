'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAppDispatch } from '@/store/hooks'
import { loginSuccess } from '@/store/slices/authSlice'
import { authAPI } from '@/lib/api/auth'
import { registerSchema, RegisterFormData } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/hooks/use-toast'
import { ArrowLeft, Mail, Lock, User, Briefcase, GraduationCap } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'mentor' | 'mentee'>('mentee')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  useEffect(() => {
    const role = searchParams.get('role')
    if (role === 'mentor') {
      setSelectedRole('mentor')
      setValue('role', 'mentor')
    } else {
      setSelectedRole('mentee')
      setValue('role', 'mentee')
    }
  }, [searchParams, setValue])

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const { confirmPassword, ...registerData } = data
      const response = await authAPI.register(registerData)
      dispatch(loginSuccess(response))
      toast({
        title: '¡Bienvenido a FIDES!',
        description: 'Tu cuenta ha sido creada exitosamente',
      })
      
      // Redirect based on role
      switch (registerData.role) {
        case 'mentor':
          router.push('/mentor')
          break
        case 'mentee':
          router.push('/mentee')
          break
        default:
          router.push('/dashboard')
      }
    } catch (error: any) {
      toast({
        title: 'Error al registrarse',
        description: error.response?.data?.message || 'No se pudo crear la cuenta',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const roleDescriptions = {
    mentor: {
      title: 'Conviértete en Mentor',
      description: 'Comparte tu experiencia y guía a otros profesionales',
      benefits: [
        'Genera ingresos adicionales',
        'Establece tu propio horario',
        'Contribuye al desarrollo profesional',
        'Amplía tu red de contactos'
      ]
    },
    mentee: {
      title: 'Encuentra tu Mentor',
      description: 'Acelera tu crecimiento profesional con guía experta',
      benefits: [
        'Aprende de profesionales experimentados',
        'Recibe feedback personalizado',
        'Define y alcanza tus objetivos',
        'Desarrolla nuevas habilidades'
      ]
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm text-gray-600">Volver al inicio</span>
            </Link>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">FIDES</h1>
              <span className="ml-2 text-sm text-muted-foreground">Sistema de Mentoría</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-2xl">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Únete a FIDES</CardTitle>
              <CardDescription className="text-lg">
                Comienza tu viaje de desarrollo profesional hoy
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Role Selection */}
              <Tabs value={selectedRole} onValueChange={(value) => {
                setSelectedRole(value as 'mentor' | 'mentee')
                setValue('role', value as 'mentor' | 'mentee')
              }} className="mb-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="mentee" className="gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Soy Aprendiz
                  </TabsTrigger>
                  <TabsTrigger value="mentor" className="gap-2">
                    <Briefcase className="h-4 w-4" />
                    Soy Mentor
                  </TabsTrigger>
                </TabsList>
                <TabsContent value={selectedRole} className="mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">
                      {roleDescriptions[selectedRole].title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {roleDescriptions[selectedRole].description}
                    </p>
                    <ul className="text-sm space-y-1">
                      {roleDescriptions[selectedRole].benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-primary">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        placeholder="Juan"
                        {...register('firstName')}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellidos</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="lastName"
                        placeholder="García"
                        {...register('lastName')}
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="juan@ejemplo.com"
                      {...register('email')}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <input type="hidden" {...register('role')} value={selectedRole} />

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      {...register('password')}
                      className="pl-10"
                      placeholder="Mínimo 8 caracteres"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register('confirmPassword')}
                      className="pl-10"
                      placeholder="Repite tu contraseña"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                  
                  <p className="text-xs text-center text-gray-600">
                    Al registrarte, aceptas nuestros{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      Términos de Uso
                    </Link>{' '}
                    y{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Política de Privacidad
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-center text-gray-600 w-full">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Inicia sesión aquí
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            © 2024 FIDES Sistema de Mentoría. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  )
}