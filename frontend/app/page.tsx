import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Target, 
  BookOpen, 
  Star,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Quote
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Users,
      title: 'Mentores Expertos',
      description: 'Conecta con profesionales experimentados en tu área de interés'
    },
    {
      icon: Calendar,
      title: 'Sesiones Flexibles',
      description: 'Programa sesiones según tu disponibilidad y la de tu mentor'
    },
    {
      icon: Target,
      title: 'Objetivos Claros',
      description: 'Define y rastrea tus metas con seguimiento personalizado'
    },
    {
      icon: MessageSquare,
      title: 'Comunicación Directa',
      description: 'Mensajería integrada para mantener el contacto continuo'
    },
    {
      icon: BookOpen,
      title: 'Recursos Compartidos',
      description: 'Accede a materiales y recursos seleccionados por expertos'
    },
    {
      icon: TrendingUp,
      title: 'Progreso Medible',
      description: 'Visualiza tu avance con métricas y feedback continuo'
    }
  ]

  const testimonials = [
    {
      name: 'María González',
      role: 'Desarrolladora Frontend',
      content: 'FIDES me ayudó a conseguir mi primer trabajo en tecnología. Mi mentor fue clave en mi preparación para las entrevistas.',
      rating: 5
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Product Manager',
      content: 'La plataforma es intuitiva y los mentores son profesionales de alto nivel. Recomiendo FIDES a cualquiera que busque crecer profesionalmente.',
      rating: 5
    },
    {
      name: 'Ana Martínez',
      role: 'Diseñadora UX',
      content: 'Gracias a mi mentora en FIDES, pude hacer la transición de carrera que tanto deseaba. El seguimiento personalizado marca la diferencia.',
      rating: 5
    }
  ]

  const stats = [
    { value: '500+', label: 'Mentores Activos' },
    { value: '2.000+', label: 'Sesiones Completadas' },
    { value: '95%', label: 'Satisfacción' },
    { value: '4,8', label: 'Valoración Media' }
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">FIDES</h1>
              <span className="ml-2 text-sm text-muted-foreground">Sistema de Mentoría</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Iniciar Sesión</Button>
              </Link>
              <Link href="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Impulsa tu carrera profesional con{' '}
              <span className="text-primary">mentoría personalizada</span>
            </h2>
            <p className="mt-6 text-xl text-gray-600">
              Conecta con mentores expertos que te guiarán en tu camino hacia el éxito profesional en España.
              Define objetivos claros, recibe feedback continuo y alcanza tu máximo potencial.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Comenzar Ahora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/mentors">
                <Button size="lg" variant="outline">
                  Explorar Mentores
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900">
              Todo lo que necesitas para crecer profesionalmente
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              Una plataforma completa diseñada para maximizar tu aprendizaje y desarrollo
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900">
              ¿Cómo funciona?
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              Comienza tu viaje de mentoría en 3 sencillos pasos
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2">Regístrate</h4>
              <p className="text-gray-600">
                Crea tu perfil y cuéntanos sobre tus objetivos profesionales y áreas de interés
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2">Encuentra tu Mentor</h4>
              <p className="text-gray-600">
                Explora perfiles de mentores y encuentra el que mejor se adapte a tus necesidades
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2">Crece y Aprende</h4>
              <p className="text-gray-600">
                Programa sesiones, define objetivos y recibe orientación personalizada
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900">
              Lo que dicen nuestros usuarios
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              Historias de éxito de profesionales españoles
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-gray-300" />
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 italic">{testimonial.content}</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12">
              ¿Por qué elegir FIDES?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg mb-2">Mentores Verificados</h4>
                  <p className="text-blue-100">
                    Todos nuestros mentores pasan por un riguroso proceso de selección
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg mb-2">Flexibilidad Total</h4>
                  <p className="text-blue-100">
                    Programa sesiones según tu disponibilidad, sin compromisos a largo plazo
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg mb-2">Seguimiento Personalizado</h4>
                  <p className="text-blue-100">
                    Define objetivos claros y recibe feedback continuo sobre tu progreso
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-lg mb-2">Comunidad Profesional</h4>
                  <p className="text-blue-100">
                    Forma parte de una red de profesionales comprometidos con el crecimiento
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Mentors Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Eres un profesional experimentado?
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Conviértete en mentor y comparte tu experiencia con la próxima generación de profesionales españoles.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Genera ingresos adicionales compartiendo tu conocimiento</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Establece tu propio horario y tarifas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Contribuye al desarrollo profesional en España</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Amplía tu red de contactos profesionales</span>
                </li>
              </ul>
              <Link href="/register?role=mentor">
                <Button size="lg" variant="outline">
                  Aplicar como Mentor
                </Button>
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h4 className="text-xl font-semibold mb-4">Requisitos para ser Mentor</h4>
              <ul className="space-y-2 text-gray-600">
                <li>• Mínimo 5 años de experiencia profesional</li>
                <li>• Experiencia demostrable en tu campo</li>
                <li>• Habilidades de comunicación excelentes</li>
                <li>• Compromiso con el desarrollo de otros</li>
                <li>• Disponibilidad mínima de 2 horas semanales</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Listo para impulsar tu carrera?
          </h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Únete a miles de profesionales españoles que ya están transformando su futuro con la ayuda de mentores expertos
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Registrarse Gratis
                <Zap className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register?role=mentor">
              <Button size="lg" variant="outline">
                Ser Mentor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-2xl font-bold mb-4">FIDES</h4>
              <p className="text-gray-400">
                La plataforma de mentoría líder en España para el desarrollo profesional
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Plataforma</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/mentors" className="hover:text-white">Buscar Mentores</Link></li>
                <li><Link href="/register?role=mentor" className="hover:text-white">Ser Mentor</Link></li>
                <li><Link href="/resources" className="hover:text-white">Recursos</Link></li>
                <li><Link href="/goals" className="hover:text-white">Objetivos</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Empresa</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">Acerca de FIDES</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contacto</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Política de Privacidad</Link></li>
                <li><Link href="/terms" className="hover:text-white">Términos de Uso</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contacto</h5>
              <ul className="space-y-2 text-gray-400">
                <li>info@fides.es</li>
                <li>+34 900 123 456</li>
                <li>Madrid, España</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FIDES Sistema de Mentoría. Todos los derechos reservados.</p>
            <p className="mt-2 text-sm">
              FIDES es una marca registrada en España. CIF: B12345678
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}