'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Video, 
  Link, 
  Upload, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  BookOpen,
  FileIcon,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import axios from '@/lib/api/axios'
import { toast } from '@/hooks/use-toast'

interface Material {
  id: string
  title: string
  description: string
  type: 'document' | 'video' | 'link' | 'other'
  url: string
  category: string
  tags: string[]
  downloads: number
  views: number
  createdAt: string
  updatedAt: string
  size?: number
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'document',
    url: '',
    category: '',
    tags: ''
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('/materials')
      setMaterials(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los materiales',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      if (editingMaterial) {
        await axios.put(`/materials/${editingMaterial.id}`, payload)
        toast({
          title: 'Material actualizado',
          description: 'El material ha sido actualizado exitosamente'
        })
      } else {
        await axios.post('/materials', payload)
        toast({
          title: 'Material agregado',
          description: 'El material ha sido agregado exitosamente'
        })
      }

      fetchMaterials()
      setIsAddDialogOpen(false)
      setEditingMaterial(null)
      setFormData({
        title: '',
        description: '',
        type: 'document',
        url: '',
        category: '',
        tags: ''
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el material',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este material?')) return

    try {
      await axios.delete(`/materials/${id}`)
      toast({
        title: 'Material eliminado',
        description: 'El material ha sido eliminado exitosamente'
      })
      fetchMaterials()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el material',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    setFormData({
      title: material.title,
      description: material.description,
      type: material.type,
      url: material.url,
      category: material.category,
      tags: material.tags.join(', ')
    })
    setIsAddDialogOpen(true)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'link':
        return <Link className="h-4 w-4" />
      default:
        return <FileIcon className="h-4 w-4" />
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'document':
        return 'default'
      case 'video':
        return 'secondary'
      case 'link':
        return 'outline'
      default:
        return 'default'
    }
  }

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || material.type === filterType
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory
    
    return matchesSearch && matchesType && matchesCategory
  })

  const categories = Array.from(new Set(materials.map(m => m.category).filter(Boolean)))

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Materiales de Mentoría</h2>
          <p className="text-muted-foreground">
            Gestiona y comparte recursos de aprendizaje con tus mentees
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingMaterial(null)
              setFormData({
                title: '',
                description: '',
                type: 'document',
                url: '',
                category: '',
                tags: ''
              })
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? 'Editar Material' : 'Agregar Nuevo Material'}
              </DialogTitle>
              <DialogDescription>
                {editingMaterial 
                  ? 'Modifica los detalles del material existente' 
                  : 'Completa los detalles del nuevo material de aprendizaje'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Introducción a React"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe el contenido del material..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo de Material</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="document">Documento</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="link">Enlace</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="url">URL o Enlace</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://ejemplo.com/material.pdf"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Programación, Diseño, Marketing..."
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="tags">Etiquetas (separadas por comas)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="react, javascript, frontend"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Guardando...' : (editingMaterial ? 'Actualizar' : 'Agregar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar materiales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="document">Documentos</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="link">Enlaces</SelectItem>
                <SelectItem value="other">Otros</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materiales</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
            <p className="text-xs text-muted-foreground">
              En tu biblioteca
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Descargas</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materials.reduce((sum, m) => sum + m.downloads, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por tus mentees
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vistas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materials.reduce((sum, m) => sum + m.views, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              De tus materiales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Áreas cubiertas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Materials List */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Vista de Cuadrícula</TabsTrigger>
          <TabsTrigger value="list">Vista de Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          {filteredMaterials.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                  ? 'No se encontraron materiales con los filtros aplicados'
                  : 'No has agregado materiales aún. ¡Comienza agregando tu primer recurso!'}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {filteredMaterials.map(material => (
                <Card key={material.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(material.type)}
                        <Badge variant={getTypeBadgeVariant(material.type) as any}>
                          {material.type}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(material)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(material.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="mt-2">{material.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {material.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Categoría:</span>
                        <Badge variant="outline">{material.category}</Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {material.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {material.views} vistas
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {material.downloads} descargas
                        </span>
                      </div>

                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => window.open(material.url, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Material
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="list">
          {filteredMaterials.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                  ? 'No se encontraron materiales con los filtros aplicados'
                  : 'No has agregado materiales aún. ¡Comienza agregando tu primer recurso!'}
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredMaterials.map(material => (
                    <div key={material.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(material.type)}
                              <h3 className="font-medium">{material.title}</h3>
                            </div>
                            <Badge variant={getTypeBadgeVariant(material.type) as any}>
                              {material.type}
                            </Badge>
                            <Badge variant="outline">{material.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {material.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Agregado {format(new Date(material.createdAt), "d 'de' MMMM, yyyy", { locale: es })}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {material.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {material.downloads}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(material.url, '_blank')}
                          >
                            Ver
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(material)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(material.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}