'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAppDispatch } from '@/store/hooks'
import { loginSuccess } from '@/store/slices/authSlice'
import { useToast } from '@/components/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const { access_token } = await response.json()
        localStorage.setItem('token', access_token)
        
        // Get user profile
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
          },
        })

        if (profileResponse.ok) {
          const userData = await profileResponse.json()
          dispatch(loginSuccess({
            user: {
              id: userData.id,
              email: userData.email,
              name: `${userData.firstName} ${userData.lastName}`,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role.toLowerCase() as 'admin' | 'mentor' | 'mentee',
              profilePicture: userData.profilePicture,
            },
            token: access_token,
          }))
          
          toast({
            title: 'Bienvenido de nuevo',
            description: 'Has iniciado sesión correctamente',
          })
          
          // Redirect based on role
          switch (userData.role.toLowerCase()) {
            case 'admin':
              router.push('/admin')
              break
            case 'mentor':
              router.push('/mentor')
              break
            case 'mentee':
              router.push('/mentee')
              break
            default:
              router.push('/dashboard')
          }
        }
      } else {
        const error = await response.json()
        toast({
          title: 'Error al iniciar sesión',
          description: error.message || 'Credenciales incorrectas',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
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
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
              <CardDescription className="text-center">
                Ingresa tus credenciales para acceder a tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="tu@email.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 border-t pt-4">
                <p className="text-sm text-center text-gray-600 mb-3">
                  Credenciales de demostración:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Administrador:</span>
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                      admin@mentorship.com / admin123
                    </code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Mentor:</span>
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                      mentor@mentorship.com / mentor123
                    </code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">Aprendiz:</span>
                    <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                      mentee@mentorship.com / mentee123
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-center text-gray-600 w-full">
                ¿No tienes una cuenta?{' '}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Regístrate aquí
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