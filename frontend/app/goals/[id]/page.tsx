'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Target,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Plus,
  TrendingUp,
  FileText,
  ArrowLeft
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from '@/hooks/use-toast'
import { AddProgressDialog } from '@/components/goals/add-progress-dialog'
import { AddMilestoneDialog } from '@/components/goals/add-milestone-dialog'

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  targetDate?: string
  status: string
  priority: string
  userId: string
  mentorId?: string
  completedAt?: string
  createdAt: string
  overallProgress: number
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  mentor?: {
    id: string
    firstName: string
    lastName: string
    email: string
    expertise?: string
  }
  session?: {
    id: string
    title: string
    scheduledAt: string
  }
  milestones: Milestone[]
  progress: ProgressEntry[]
}

interface Milestone {
  id: string
  title: string
  description?: string
  targetDate?: string
  completed: boolean
  completedAt?: string
  order: number
}

interface ProgressEntry {
  id: string
  description: string
  percentage: number
  evidenceUrl?: string
  notes?: string
  recordedBy: string
  createdAt: string
}

const statusColors = {
  NOT_STARTED: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProgressDialog, setShowProgressDialog] = useState(false)
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchGoal()
    }
  }, [params.id])

  const fetchGoal = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/goals/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setGoal(data)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load goal',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error fetching goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to load goal',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddProgress = async (data: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/goals/${params.id}/progress`,
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
          description: 'Progress added successfully',
        })
        setShowProgressDialog(false)
        fetchGoal()
      }
    } catch (error) {
      console.error('Error adding progress:', error)
      toast({
        title: 'Error',
        description: 'Failed to add progress',
        variant: 'destructive',
      })
    }
  }

  const handleAddMilestone = async (data: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/goals/${params.id}/milestones`,
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
          description: 'Milestone added successfully',
        })
        setShowMilestoneDialog(false)
        fetchGoal()
      }
    } catch (error) {
      console.error('Error adding milestone:', error)
      toast({
        title: 'Error',
        description: 'Failed to add milestone',
        variant: 'destructive',
      })
    }
  }

  const handleToggleMilestone = async (milestoneId: string, completed: boolean) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/goals/milestones/${milestoneId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ completed }),
        }
      )

      if (response.ok) {
        fetchGoal()
      }
    } catch (error) {
      console.error('Error updating milestone:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!goal) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Goal not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canEdit = user?.id === goal.userId || user?.id === goal.mentorId

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        onClick={() => router.push('/goals')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Goals
      </Button>

      {/* Goal Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{goal.title}</h1>
            {goal.description && (
              <p className="text-gray-600 text-lg">{goal.description}</p>
            )}
          </div>
          <Badge className={statusColors[goal.status as keyof typeof statusColors]}>
            {goal.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>Created by {goal.user.firstName} {goal.user.lastName}</span>
          </div>
          {goal.mentor && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Mentor: {goal.mentor.firstName} {goal.mentor.lastName}</span>
            </div>
          )}
          {goal.targetDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Target: {format(new Date(goal.targetDate), 'MMM d, yyyy')}</span>
            </div>
          )}
          <Badge variant="outline">{goal.category}</Badge>
          <Badge variant="secondary">{goal.priority} Priority</Badge>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{goal.overallProgress}%</span>
            </div>
            <Progress value={goal.overallProgress} className="h-3" />
            {goal.status === 'COMPLETED' && goal.completedAt && (
              <p className="text-sm text-green-600 mt-2">
                Completed on {format(new Date(goal.completedAt), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="milestones" className="space-y-4">
        <TabsList>
          <TabsTrigger value="milestones">
            Milestones ({goal.milestones.length})
          </TabsTrigger>
          <TabsTrigger value="progress">
            Progress Updates ({goal.progress.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="milestones" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Milestones</h3>
            {canEdit && (
              <Button size="sm" onClick={() => setShowMilestoneDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Milestone
              </Button>
            )}
          </div>

          {goal.milestones.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600 mb-4">No milestones yet</p>
                {canEdit && (
                  <Button onClick={() => setShowMilestoneDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Milestone
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {goal.milestones.map((milestone) => (
                <Card key={milestone.id}>
                  <CardContent className="flex items-start gap-3 py-4">
                    <Checkbox
                      checked={milestone.completed}
                      onCheckedChange={(checked) => handleToggleMilestone(milestone.id, checked as boolean)}
                      disabled={!canEdit}
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${milestone.completed ? 'line-through text-gray-500' : ''}`}>
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        {milestone.targetDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(milestone.targetDate), 'MMM d, yyyy')}
                          </span>
                        )}
                        {milestone.completed && milestone.completedAt && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed {format(new Date(milestone.completedAt), 'MMM d')}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Progress Updates</h3>
            {canEdit && (
              <Button size="sm" onClick={() => setShowProgressDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Progress
              </Button>
            )}
          </div>

          {goal.progress.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600 mb-4">No progress updates yet</p>
                {canEdit && (
                  <Button onClick={() => setShowProgressDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Update
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {goal.progress.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <CardTitle className="text-base">{entry.description}</CardTitle>
                      </div>
                      <Badge variant="outline">{entry.percentage}%</Badge>
                    </div>
                    <CardDescription>
                      {format(new Date(entry.createdAt), 'MMM d, yyyy at h:mm a')}
                    </CardDescription>
                  </CardHeader>
                  {(entry.notes || entry.evidenceUrl) && (
                    <CardContent>
                      {entry.notes && (
                        <p className="text-sm text-gray-600">{entry.notes}</p>
                      )}
                      {entry.evidenceUrl && (
                        <a
                          href={entry.evidenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                        >
                          <FileText className="h-3 w-3" />
                          View Evidence
                        </a>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showProgressDialog && (
        <AddProgressDialog
          open={showProgressDialog}
          onClose={() => setShowProgressDialog(false)}
          onSubmit={handleAddProgress}
        />
      )}

      {showMilestoneDialog && (
        <AddMilestoneDialog
          open={showMilestoneDialog}
          onClose={() => setShowMilestoneDialog(false)}
          onSubmit={handleAddMilestone}
        />
      )}
    </div>
  )
}