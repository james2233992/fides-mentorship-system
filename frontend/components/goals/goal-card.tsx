'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar,
  Target,
  User,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical
} from 'lucide-react'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface GoalCardProps {
  goal: {
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
  onUpdate: () => void
}

const statusIcons = {
  NOT_STARTED: Clock,
  IN_PROGRESS: Target,
  COMPLETED: CheckCircle2,
  ON_HOLD: AlertCircle,
  CANCELLED: AlertCircle,
}

const statusColors = {
  NOT_STARTED: 'text-gray-500',
  IN_PROGRESS: 'text-blue-500',
  COMPLETED: 'text-green-500',
  ON_HOLD: 'text-yellow-500',
  CANCELLED: 'text-red-500',
}

const priorityColors = {
  LOW: 'default',
  MEDIUM: 'secondary',
  HIGH: 'destructive',
  URGENT: 'destructive',
} as const

export function GoalCard({ goal, onUpdate }: GoalCardProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const StatusIcon = statusIcons[goal.status as keyof typeof statusIcons] || Target
  const statusColor = statusColors[goal.status as keyof typeof statusColors] || 'text-gray-500'

  const daysUntilDeadline = goal.targetDate
    ? Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0 && goal.status !== 'COMPLETED'

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/goals/${goal.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error('Error updating goal status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/goals/${goal.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={`h-5 w-5 ${statusColor}`} />
              <CardTitle className="text-lg">{goal.title}</CardTitle>
            </div>
            {goal.description && (
              <CardDescription className="line-clamp-2">
                {goal.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {goal.status !== 'COMPLETED' && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  handleStatusUpdate('COMPLETED')
                }}>
                  Mark as Completed
                </DropdownMenuItem>
              )}
              {goal.status !== 'ON_HOLD' && goal.status !== 'COMPLETED' && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  handleStatusUpdate('ON_HOLD')
                }}>
                  Put on Hold
                </DropdownMenuItem>
              )}
              {goal.status === 'ON_HOLD' && (
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  handleStatusUpdate('IN_PROGRESS')
                }}>
                  Resume
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress */}
          {goal.overallProgress !== undefined && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span className="font-medium">{goal.overallProgress}%</span>
              </div>
              <Progress value={goal.overallProgress} className="h-2" />
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline">{goal.category}</Badge>
            <Badge variant={priorityColors[goal.priority as keyof typeof priorityColors]}>
              {goal.priority}
            </Badge>
            {goal.mentor && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{goal.mentor.firstName} {goal.mentor.lastName}</span>
              </div>
            )}
          </div>

          {/* Milestones and Deadline */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {goal._count.milestones > 0 && (
                <span>{goal._count.milestones} milestones</span>
              )}
              {goal._count.progress > 0 && (
                <span>{goal._count.progress} updates</span>
              )}
            </div>
            {goal.targetDate && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
                <Calendar className="h-3 w-3" />
                <span>
                  {isOverdue 
                    ? `Overdue by ${Math.abs(daysUntilDeadline)} days`
                    : format(new Date(goal.targetDate), 'MMM d, yyyy')
                  }
                </span>
              </div>
            )}
          </div>

          {/* View Details */}
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" className="gap-1" onClick={(e) => {
              e.stopPropagation()
              router.push(`/goals/${goal.id}`)
            }}>
              View Details
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}