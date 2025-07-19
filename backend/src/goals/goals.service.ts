import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { CreateProgressDto } from './dto/create-progress.dto';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { GoalStatus, UserRole, Prisma } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(createGoalDto: CreateGoalDto, userId: string) {
    // If mentorId is provided, verify the mentor exists and is actually a mentor
    if (createGoalDto.mentorId) {
      const mentor = await this.prisma.user.findUnique({
        where: { id: createGoalDto.mentorId },
      });

      if (!mentor || mentor.role !== UserRole.MENTOR) {
        throw new NotFoundException('Mentor not found');
      }
    }

    // If sessionId is provided, verify the session exists and user is part of it
    if (createGoalDto.sessionId) {
      const session = await this.prisma.mentorshipSession.findUnique({
        where: { id: createGoalDto.sessionId },
      });

      if (!session) {
        throw new NotFoundException('Session not found');
      }

      if (session.menteeId !== userId && session.mentorId !== userId) {
        throw new ForbiddenException('You are not part of this session');
      }
    }

    return this.prisma.goal.create({
      data: {
        ...createGoalDto,
        userId,
        targetDate: createGoalDto.targetDate ? new Date(createGoalDto.targetDate) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        milestones: {
          orderBy: { order: 'asc' },
        },
        progress: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });
  }

  async findAll(
    userId: string,
    userRole: UserRole,
    filters?: {
      status?: GoalStatus;
      category?: string;
      mentorId?: string;
      includeShared?: boolean;
    },
  ) {
    const where: Prisma.GoalWhereInput = {};

    // Base condition: user's own goals or goals they mentor
    if (userRole === UserRole.ADMIN) {
      // Admin can see all goals
    } else if (userRole === UserRole.MENTOR) {
      where.OR = [
        { userId },
        { mentorId: userId },
      ];
    } else {
      // Mentees only see their own goals
      where.userId = userId;
    }

    // Apply filters
    if (filters) {
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.category) {
        where.category = filters.category;
      }
      if (filters.mentorId) {
        where.mentorId = filters.mentorId;
      }
    }

    return this.prisma.goal.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            milestones: true,
            progress: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            expertise: true,
          },
        },
        session: {
          select: {
            id: true,
            title: true,
            scheduledAt: true,
          },
        },
        milestones: {
          orderBy: { order: 'asc' },
        },
        progress: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    // Check access permissions
    const hasAccess = 
      goal.userId === userId ||
      goal.mentorId === userId ||
      userRole === UserRole.ADMIN;

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this goal');
    }

    // Calculate overall progress
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    const totalMilestones = goal.milestones.length;
    const milestoneProgress = totalMilestones > 0 
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    // Get latest progress percentage
    const latestProgress = goal.progress[0]?.percentage || 0;

    return {
      ...goal,
      overallProgress: Math.max(milestoneProgress, latestProgress),
    };
  }

  async update(id: string, updateGoalDto: UpdateGoalDto, userId: string, userRole: UserRole) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    // Check permissions
    const canEdit = 
      goal.userId === userId ||
      goal.mentorId === userId ||
      userRole === UserRole.ADMIN;

    if (!canEdit) {
      throw new ForbiddenException('You do not have permission to update this goal');
    }

    // Set completedAt if status is changing to COMPLETED
    const updateData: any = {
      ...updateGoalDto,
      targetDate: updateGoalDto.targetDate ? new Date(updateGoalDto.targetDate) : undefined,
    };

    if (updateGoalDto.status === GoalStatus.COMPLETED && goal.status !== GoalStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    return this.prisma.goal.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId: string, userRole: UserRole) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    // Only goal owner or admin can delete
    if (goal.userId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only delete your own goals');
    }

    return this.prisma.goal.delete({
      where: { id },
    });
  }

  // Progress management
  async addProgress(goalId: string, createProgressDto: CreateProgressDto, userId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    // Check permissions - goal owner or mentor can add progress
    if (goal.userId !== userId && goal.mentorId !== userId) {
      throw new ForbiddenException('You do not have permission to add progress to this goal');
    }

    const progress = await this.prisma.progress.create({
      data: {
        ...createProgressDto,
        goalId,
        recordedBy: userId,
      },
    });

    // Update goal status if progress is 100%
    if (createProgressDto.percentage === 100) {
      await this.prisma.goal.update({
        where: { id: goalId },
        data: {
          status: GoalStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
    }

    return progress;
  }

  async getProgress(goalId: string, userId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    // Check permissions
    if (goal.userId !== userId && goal.mentorId !== userId) {
      throw new ForbiddenException('You do not have access to this goal progress');
    }

    return this.prisma.progress.findMany({
      where: { goalId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Milestone management
  async addMilestone(goalId: string, createMilestoneDto: CreateMilestoneDto, userId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    // Check permissions
    if (goal.userId !== userId && goal.mentorId !== userId) {
      throw new ForbiddenException('You do not have permission to add milestones to this goal');
    }

    // Get the next order number if not provided
    if (createMilestoneDto.order === undefined) {
      const lastMilestone = await this.prisma.milestone.findFirst({
        where: { goalId },
        orderBy: { order: 'desc' },
      });
      createMilestoneDto.order = (lastMilestone?.order || 0) + 1;
    }

    return this.prisma.milestone.create({
      data: {
        ...createMilestoneDto,
        goalId,
        targetDate: createMilestoneDto.targetDate ? new Date(createMilestoneDto.targetDate) : undefined,
      },
    });
  }

  async updateMilestone(milestoneId: string, completed: boolean, userId: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        goal: true,
      },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    // Check permissions
    if (milestone.goal.userId !== userId && milestone.goal.mentorId !== userId) {
      throw new ForbiddenException('You do not have permission to update this milestone');
    }

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    });
  }

  // Analytics
  async getGoalStats(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: {
        milestones: true,
        progress: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const stats = {
      total: goals.length,
      byStatus: {
        notStarted: 0,
        inProgress: 0,
        completed: 0,
        onHold: 0,
        cancelled: 0,
      },
      byCategory: {} as Record<string, number>,
      avgProgress: 0,
      upcomingDeadlines: 0,
    };

    let totalProgress = 0;

    goals.forEach(goal => {
      // Count by status
      stats.byStatus[goal.status.toLowerCase() as keyof typeof stats.byStatus]++;

      // Count by category
      stats.byCategory[goal.category] = (stats.byCategory[goal.category] || 0) + 1;

      // Calculate progress
      const latestProgress = goal.progress[0]?.percentage || 0;
      totalProgress += latestProgress;

      // Count upcoming deadlines (within 30 days)
      if (goal.targetDate) {
        const daysUntilDeadline = Math.ceil(
          (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDeadline > 0 && daysUntilDeadline <= 30) {
          stats.upcomingDeadlines++;
        }
      }
    });

    stats.avgProgress = goals.length > 0 ? Math.round(totalProgress / goals.length) : 0;

    return stats;
  }

  async getCategories() {
    const goals = await this.prisma.goal.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return goals.map(g => g.category);
  }
}