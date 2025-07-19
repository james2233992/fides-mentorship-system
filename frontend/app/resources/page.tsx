'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Plus, 
  FileText, 
  Video, 
  Link, 
  Code, 
  File,
  MoreHorizontal,
  Tag,
  Filter
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from '@/hooks/use-toast'
import { CreateResourceDialog } from '@/components/resources/create-resource-dialog'

interface Resource {
  id: string
  title: string
  description?: string
  url?: string
  filePath?: string
  type: string
  category: string
  tags: string[]
  isPublic: boolean
  authorId: string
  sessionId?: string
  createdAt: string
  author: {
    id: string
    firstName: string
    lastName: string
    role: string
  }
  session?: {
    id: string
    title: string
  }
}

const typeIcons = {
  DOCUMENT: FileText,
  VIDEO: Video,
  LINK: Link,
  CODE_SNIPPET: Code,
  TEMPLATE: File,
  OTHER: MoreHorizontal,
}

export default function ResourcesPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)
  const [resources, setResources] = useState<Resource[]>([])
  const [myResources, setMyResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [categories, setCategories] = useState<string[]>([])
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchResources()
    fetchCategories()
    fetchPopularTags()
    if (user) {
      fetchMyResources()
    }
  }, [])

  const fetchResources = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedType !== 'all') params.append('type', selectedType)
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','))

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/resources?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setResources(data)
      }
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast({
        title: 'Error',
        description: 'Failed to load resources',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMyResources = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/resources/my-resources`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setMyResources(data)
      }
    } catch (error) {
      console.error('Error fetching my resources:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/resources/categories`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchPopularTags = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/resources/tags/popular`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setPopularTags(data)
      }
    } catch (error) {
      console.error('Error fetching popular tags:', error)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResources()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery, selectedCategory, selectedType, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleCreateResource = async (data: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/resources`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      )

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Resource created successfully',
        })
        setShowCreateDialog(false)
        fetchResources()
        fetchMyResources()
      }
    } catch (error) {
      console.error('Error creating resource:', error)
      toast({
        title: 'Error',
        description: 'Failed to create resource',
        variant: 'destructive',
      })
    }
  }

  const ResourceCard = ({ resource }: { resource: Resource }) => {
    const Icon = typeIcons[resource.type as keyof typeof typeIcons] || MoreHorizontal

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Icon className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  <span>{resource.author.firstName} {resource.author.lastName}</span>
                  <span>•</span>
                  <span>{format(new Date(resource.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
            <Badge variant={resource.isPublic ? 'default' : 'secondary'}>
              {resource.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {resource.description && (
            <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
          )}
          
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline">{resource.category}</Badge>
            {resource.session && (
              <Badge variant="outline" className="text-xs">
                Session: {resource.session.title}
              </Badge>
            )}
          </div>

          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            {resource.url && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(resource.url, '_blank')}
              >
                <Link className="h-4 w-4 mr-1" />
                Open Link
              </Button>
            )}
            {resource.filePath && (
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-1" />
                Download
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Please log in to view resources</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Learning Resources</h1>
          <p className="text-gray-600 mt-2">
            Discover and share resources to enhance your learning journey
          </p>
        </div>
        {(user.role === 'mentor' || user.role === 'admin') && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="DOCUMENT">Document</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="LINK">Link</SelectItem>
                  <SelectItem value="CODE_SNIPPET">Code Snippet</SelectItem>
                  <SelectItem value="TEMPLATE">Template</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <div className="mt-4">
              <Label className="mb-2 block">Popular Tags</Label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(({ tag, count }) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag} ({count})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resources Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="my">My Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p>Loading resources...</p>
            </div>
          ) : resources.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p>No resources found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-4">
          {myResources.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p>You haven't created any resources yet</p>
                {(user.role === 'mentor' || user.role === 'admin') && (
                  <Button
                    className="mt-4"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Resource
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Resource Dialog */}
      {showCreateDialog && (
        <CreateResourceDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSubmit={handleCreateResource}
        />
      )}
    </div>
  )
}