'use client'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Target, 
  Plus, 
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  BarChart3
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from '@/hooks/use-toast'
import { CreateGoalDialog } from '@/components/goals/create-goal-dialog'
import { GoalCard } from '@/components/goals/goal-card'

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
  user: {
    id: string
    firstName: string
    lastName: string
  }
  mentor?: {
    id: string
    firstName: string
    lastName: string
  }
  _count: {
    milestones: number
    progress: number
  }
  overallProgress?: number
}

interface GoalStats {
  total: number
  byStatus: {
    notStarted: number
    inProgress: number
    completed: number
    onHold: number
    cancelled: number
  }
  byCategory: Record<string, number>
  avgProgress: number
  upcomingDeadlines: number
}

const statusColors = {
  NOT_STARTED: 'bg-gray-500',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-green-500',
  ON_HOLD: 'bg-yellow-500',
  CANCELLED: 'bg-red-500',
}

const priorityColors = {
  LOW: 'default',
  MEDIUM: 'secondary',
  HIGH: 'destructive',
  URGENT: 'destructive',
} as const

export default function GoalsPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const token = useSelector((state: RootState) => state.auth.token)
  const [goals, setGoals] = useState<Goal[]>([])
  const [stats, setStats] = useState<GoalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    if (user) {
      fetchGoals()
      fetchStats()
    }
  }, [user])

  const fetchGoals = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/goals?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
      toast({
        title: 'Error',
        description: 'Failed to load goals',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/goals/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [selectedCategory, selectedStatus])

  const handleCreateGoal = async (data: any) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/goals`,
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
          description: 'Goal created successfully',
        })
        setShowCreateDialog(false)
        fetchGoals()
        fetchStats()
      }
    } catch (error) {
      console.error('Error creating goal:', error)
      toast({
        title: 'Error',
        description: 'Failed to create goal',
        variant: 'destructive',
      })
    }
  }

  const activeGoals = goals.filter(g => g.status === 'IN_PROGRESS')
  const completedGoals = goals.filter(g => g.status === 'COMPLETED')
  const upcomingDeadlines = goals.filter(g => {
    if (!g.targetDate || g.status === 'COMPLETED') return false
    const daysUntil = Math.ceil(
      (new Date(g.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysUntil > 0 && daysUntil <= 7
  })

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p>Please log in to view your goals</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Goals</h1>
          <p className="text-gray-600 mt-2">
            Track your progress and achieve your objectives
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byStatus.inProgress}</div>
              <Progress value={(stats.byStatus.inProgress / stats.total) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.byStatus.completed}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.byStatus.completed / stats.total) * 100)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgProgress}%</div>
              <Progress value={stats.avgProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.upcomingDeadlines}</div>
              <p className="text-xs text-muted-foreground">
                Within 30 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upcoming Deadlines Alert */}
      {upcomingDeadlines.length > 0 && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Upcoming deadlines:</strong> You have {upcomingDeadlines.length} goal(s) due within the next week.
            Review them below to stay on track.
          </AlertDescription>
        </Alert>
      )}

      {/* Goals Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="active">Active Goals</TabsTrigger>
            <TabsTrigger value="all">All Goals</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              {stats && Object.keys(stats.byCategory).map(category => (
                <option key={category} value={category}>
                  {category} ({stats.byCategory[category]})
                </option>
              ))}
            </select>
          </div>
        </div>

        <TabsContent value="active" className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <p>Loading goals...</p>
            </div>
          ) : activeGoals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No active goals yet</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onUpdate={() => {
                  fetchGoals()
                  fetchStats()
                }} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {goals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p>No goals found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onUpdate={() => {
                  fetchGoals()
                  fetchStats()
                }} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedGoals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p>No completed goals yet. Keep working on your active goals!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onUpdate={() => {
                  fetchGoals()
                  fetchStats()
                }} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Goal Dialog */}
      {showCreateDialog && (
        <CreateGoalDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onSubmit={handleCreateGoal}
        />
      )}
    </div>
  )
}