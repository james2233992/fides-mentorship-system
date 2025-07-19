import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Construction } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ComingSoonProps {
  title: string
  description?: string
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  const router = useRouter()
  
  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <Construction className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description || 'Esta funcionalidad estará disponible próximamente'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => router.back()}>
            Volver
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}