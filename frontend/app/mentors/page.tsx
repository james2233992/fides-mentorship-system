'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Search, Calendar, Star, ChevronLeft, Filter, X, Clock, Award, Globe } from 'lucide-react'
import { useAppSelector } from '@/store/hooks'
import { useToast } from '@/hooks/use-toast'
import axios from '@/lib/api/axios'

interface Mentor {
  id: string
  firstName: string
  lastName: string
  email: string
  bio: string
  expertise: string
  profilePicture?: string
  rating?: number
  yearsOfExperience?: number
  availability?: {
    days: string[]
    timeSlots: string[]
  }
  languages?: string[]
  sessionCount?: number
  pricePerHour?: number
}

interface Filters {
  expertise: string[]
  minRating: number
  maxPrice: number
  availability: {
    days: string[]
    timeSlots: string[]
  }
  languages: string[]
  yearsOfExperience: string[]
}

const defaultFilters: Filters = {
  expertise: [],
  minRating: 0,
  maxPrice: 1000,
  availability: {
    days: [],
    timeSlots: []
  },
  languages: [],
  yearsOfExperience: []
}

const expertiseOptions = [
  'JavaScript', 'React', 'Node.js', 'TypeScript', 'Python', 
  'Java', 'Product Management', 'UX/UI Design', 'Data Science',
  'Machine Learning', 'DevOps', 'Cloud Computing', 'Mobile Development',
  'System Design', 'Agile', 'Leadership', 'Career Development'
]

const dayOptions = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
]

const timeSlotOptions = [
  { value: 'morning', label: 'Mañana (8:00 - 12:00)' },
  { value: 'afternoon', label: 'Tarde (12:00 - 18:00)' },
  { value: 'evening', label: 'Noche (18:00 - 22:00)' }
]

const languageOptions = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
  { value: 'pt', label: 'Portugués' },
  { value: 'fr', label: 'Francés' }
]

const experienceRanges = [
  { value: '0-2', label: '0-2 años' },
  { value: '3-5', label: '3-5 años' },
  { value: '6-10', label: '6-10 años' },
  { value: '10+', label: 'Más de 10 años' }
]

export default function MentorsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAppSelector((state) => state.auth)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'sessions' | 'price'>('rating')
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  useEffect(() => {
    fetchMentors()
  }, [])

  useEffect(() => {
    // Calcular número de filtros activos
    let count = 0
    if (filters.expertise.length > 0) count++
    if (filters.minRating > 0) count++
    if (filters.maxPrice < 1000) count++
    if (filters.availability.days.length > 0) count++
    if (filters.availability.timeSlots.length > 0) count++
    if (filters.languages.length > 0) count++
    if (filters.yearsOfExperience.length > 0) count++
    setActiveFiltersCount(count)
  }, [filters])

  const fetchMentors = async () => {
    try {
      const response = await axios.get('/users/mentors')
      
      // Filter only mentors and add mock data for demo
      const mentorUsers = response.data
        .filter((user: any) => user.role === 'mentor' || user.role === 'admin')
        .map((mentor: any) => ({
          ...mentor,
          rating: Math.random() * 2 + 3, // Random rating between 3-5
          yearsOfExperience: Math.floor(Math.random() * 15),
          sessionCount: Math.floor(Math.random() * 100),
          pricePerHour: Math.floor(Math.random() * 80) + 20,
          languages: ['es', Math.random() > 0.5 ? 'en' : null].filter(Boolean),
          availability: {
            days: ['monday', 'wednesday', 'friday'],
            timeSlots: ['morning', 'afternoon']
          }
        }))
      
      setMentors(mentorUsers)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar los mentores',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = useCallback((mentor: Mentor) => {
    // Filtro por expertise
    if (filters.expertise.length > 0) {
      const mentorExpertise = mentor.expertise?.toLowerCase() || ''
      const hasExpertise = filters.expertise.some(exp => 
        mentorExpertise.includes(exp.toLowerCase())
      )
      if (!hasExpertise) return false
    }

    // Filtro por rating mínimo
    if (filters.minRating > 0 && (mentor.rating || 0) < filters.minRating) {
      return false
    }

    // Filtro por precio máximo
    if (mentor.pricePerHour && mentor.pricePerHour > filters.maxPrice) {
      return false
    }

    // Filtro por disponibilidad de días
    if (filters.availability.days.length > 0) {
      const hasDay = filters.availability.days.some(day =>
        mentor.availability?.days.includes(day)
      )
      if (!hasDay) return false
    }

    // Filtro por disponibilidad de horarios
    if (filters.availability.timeSlots.length > 0) {
      const hasTimeSlot = filters.availability.timeSlots.some(slot =>
        mentor.availability?.timeSlots.includes(slot)
      )
      if (!hasTimeSlot) return false
    }

    // Filtro por idiomas
    if (filters.languages.length > 0) {
      const hasLanguage = filters.languages.some(lang =>
        mentor.languages?.includes(lang)
      )
      if (!hasLanguage) return false
    }

    // Filtro por años de experiencia
    if (filters.yearsOfExperience.length > 0) {
      const experience = mentor.yearsOfExperience || 0
      const inRange = filters.yearsOfExperience.some(range => {
        switch (range) {
          case '0-2': return experience >= 0 && experience <= 2
          case '3-5': return experience >= 3 && experience <= 5
          case '6-10': return experience >= 6 && experience <= 10
          case '10+': return experience > 10
          default: return false
        }
      })
      if (!inRange) return false
    }

    return true
  }, [filters])

  const filteredAndSortedMentors = useMemo(() => mentors
    .filter(mentor =>
      (mentor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       mentor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       mentor.expertise?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      applyFilters(mentor)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'experience':
          return (b.yearsOfExperience || 0) - (a.yearsOfExperience || 0)
        case 'sessions':
          return (b.sessionCount || 0) - (a.sessionCount || 0)
        case 'price':
          return (a.pricePerHour || 0) - (b.pricePerHour || 0)
        default:
          return 0
      }
    }), [mentors, searchTerm, sortBy, applyFilters])

  const handleScheduleSession = (mentorId: string) => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para agendar una sesión',
        variant: 'destructive',
      })
      router.push('/login')
      return
    }

    router.push(`/mentors/${mentorId}/schedule`)
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Encuentra tu Mentor</h1>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Mejor valoración</SelectItem>
              <SelectItem value="experience">Más experiencia</SelectItem>
              <SelectItem value="sessions">Más sesiones</SelectItem>
              <SelectItem value="price">Menor precio</SelectItem>
            </SelectContent>
          </Select>

          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filtros de búsqueda</SheetTitle>
                <SheetDescription>
                  Refina tu búsqueda para encontrar el mentor ideal
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Expertise */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Expertise</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {expertiseOptions.map((exp) => (
                      <div key={exp} className="flex items-center space-x-2">
                        <Checkbox
                          id={exp}
                          checked={filters.expertise.includes(exp)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters({ ...filters, expertise: [...filters.expertise, exp] })
                            } else {
                              setFilters({ 
                                ...filters, 
                                expertise: filters.expertise.filter(e => e !== exp) 
                              })
                            }
                          }}
                        />
                        <Label 
                          htmlFor={exp} 
                          className="text-sm font-normal cursor-pointer"
                        >
                          {exp}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating mínimo */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Rating mínimo: {filters.minRating > 0 ? filters.minRating : 'Cualquiera'}
                  </Label>
                  <Slider
                    value={[filters.minRating]}
                    onValueChange={([value]) => setFilters({ ...filters, minRating: value })}
                    min={0}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>5</span>
                  </div>
                </div>

                {/* Precio máximo */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    Precio máximo por hora: ${filters.maxPrice}
                  </Label>
                  <Slider
                    value={[filters.maxPrice]}
                    onValueChange={([value]) => setFilters({ ...filters, maxPrice: value })}
                    min={0}
                    max={200}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>$0</span>
                    <span>$200</span>
                  </div>
                </div>

                {/* Disponibilidad por días */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Días disponibles</Label>
                  <div className="space-y-2">
                    {dayOptions.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={day.value}
                          checked={filters.availability.days.includes(day.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters({ 
                                ...filters, 
                                availability: {
                                  ...filters.availability,
                                  days: [...filters.availability.days, day.value]
                                }
                              })
                            } else {
                              setFilters({ 
                                ...filters, 
                                availability: {
                                  ...filters.availability,
                                  days: filters.availability.days.filter(d => d !== day.value)
                                }
                              })
                            }
                          }}
                        />
                        <Label 
                          htmlFor={day.value} 
                          className="text-sm font-normal cursor-pointer"
                        >
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Horarios */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Horarios preferidos</Label>
                  <div className="space-y-2">
                    {timeSlotOptions.map((slot) => (
                      <div key={slot.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={slot.value}
                          checked={filters.availability.timeSlots.includes(slot.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters({ 
                                ...filters, 
                                availability: {
                                  ...filters.availability,
                                  timeSlots: [...filters.availability.timeSlots, slot.value]
                                }
                              })
                            } else {
                              setFilters({ 
                                ...filters, 
                                availability: {
                                  ...filters.availability,
                                  timeSlots: filters.availability.timeSlots.filter(s => s !== slot.value)
                                }
                              })
                            }
                          }}
                        />
                        <Label 
                          htmlFor={slot.value} 
                          className="text-sm font-normal cursor-pointer"
                        >
                          {slot.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Idiomas */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Idiomas</Label>
                  <div className="space-y-2">
                    {languageOptions.map((lang) => (
                      <div key={lang.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={lang.value}
                          checked={filters.languages.includes(lang.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters({ 
                                ...filters, 
                                languages: [...filters.languages, lang.value]
                              })
                            } else {
                              setFilters({ 
                                ...filters, 
                                languages: filters.languages.filter(l => l !== lang.value)
                              })
                            }
                          }}
                        />
                        <Label 
                          htmlFor={lang.value} 
                          className="text-sm font-normal cursor-pointer"
                        >
                          {lang.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Años de experiencia */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Años de experiencia</Label>
                  <div className="space-y-2">
                    {experienceRanges.map((range) => (
                      <div key={range.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={range.value}
                          checked={filters.yearsOfExperience.includes(range.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters({ 
                                ...filters, 
                                yearsOfExperience: [...filters.yearsOfExperience, range.value]
                              })
                            } else {
                              setFilters({ 
                                ...filters, 
                                yearsOfExperience: filters.yearsOfExperience.filter(r => r !== range.value)
                              })
                            }
                          }}
                        />
                        <Label 
                          htmlFor={range.value} 
                          className="text-sm font-normal cursor-pointer"
                        >
                          {range.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={resetFilters}
                  >
                    Limpiar filtros
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => setShowFilters(false)}
                  >
                    Aplicar filtros
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.expertise.map((exp) => (
            <Badge key={exp} variant="secondary" className="gap-1">
              {exp}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({
                  ...filters,
                  expertise: filters.expertise.filter(e => e !== exp)
                })}
              />
            </Badge>
          ))}
          {filters.minRating > 0 && (
            <Badge variant="secondary" className="gap-1">
              Rating ≥ {filters.minRating}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, minRating: 0 })}
              />
            </Badge>
          )}
          {filters.maxPrice < 1000 && (
            <Badge variant="secondary" className="gap-1">
              Precio ≤ ${filters.maxPrice}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, maxPrice: 1000 })}
              />
            </Badge>
          )}
          {filters.languages.map((lang) => (
            <Badge key={lang} variant="secondary" className="gap-1">
              {languageOptions.find(l => l.value === lang)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({
                  ...filters,
                  languages: filters.languages.filter(l => l !== lang)
                })}
              />
            </Badge>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            {filteredAndSortedMentors.length} mentores encontrados
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedMentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={mentor.profilePicture} />
                      <AvatarFallback>
                        {mentor.firstName?.charAt(0)?.toUpperCase()}
                        {mentor.lastName?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {mentor.firstName} {mentor.lastName}
                        </CardTitle>
                        {mentor.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{mentor.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <CardDescription className="mt-1 line-clamp-2">
                        {mentor.bio || 'Sin biografía disponible'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mentor.expertise && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Expertise:</p>
                        <div className="flex flex-wrap gap-1">
                          {mentor.expertise.split(',').slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill.trim()}
                            </Badge>
                          ))}
                          {mentor.expertise.split(',').length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{mentor.expertise.split(',').length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        {mentor.yearsOfExperience !== undefined && (
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {mentor.yearsOfExperience} años
                          </span>
                        )}
                        {mentor.sessionCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {mentor.sessionCount} sesiones
                          </span>
                        )}
                      </div>
                      {mentor.pricePerHour && (
                        <span className="font-semibold">
                          ${mentor.pricePerHour}/hr
                        </span>
                      )}
                    </div>

                    {mentor.languages && mentor.languages.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <div className="flex gap-1">
                          {mentor.languages.map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {languageOptions.find(l => l.value === lang)?.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      className="w-full"
                      onClick={() => handleScheduleSession(mentor.id)}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Sesión
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {!loading && filteredAndSortedMentors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No se encontraron mentores con los criterios seleccionados</p>
          <Button variant="outline" onClick={resetFilters}>
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  )
}