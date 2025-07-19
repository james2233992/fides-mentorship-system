import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverviewStats() {
    const [
      totalUsers,
      totalMentors,
      totalMentees,
      totalSessions,
      completedSessions,
      activeUsers,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'MENTOR' } }),
      this.prisma.user.count({ where: { role: 'MENTEE' } }),
      this.prisma.mentorshipSession.count(),
      this.prisma.mentorshipSession.count({ where: { status: SessionStatus.COMPLETED } }),
      this.getActiveUsersCount(),
      this.calculateTotalRevenue(),
    ]);

    const averageRating = await this.calculateAverageRating();
    const sessionCompletionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    return {
      users: {
        total: totalUsers,
        mentors: totalMentors,
        mentees: totalMentees,
        activeLastMonth: activeUsers,
      },
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        completionRate: Math.round(sessionCompletionRate),
      },
      revenue: {
        total: totalRevenue,
        currency: 'USD',
      },
      ratings: {
        average: averageRating,
        scale: 5,
      },
    };
  }

  async getUserGrowthStats(period: 'week' | 'month' | 'year') {
    const now = new Date();
    const startDate = this.getStartDate(now, period);
    
    const usersByDate = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    // Group by period
    const growth = this.groupByPeriod(usersByDate, period);
    
    const mentorGrowth = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        role: 'MENTOR',
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    const menteeGrowth = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        role: 'MENTEE',
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    return {
      period,
      totalGrowth: growth,
      mentorGrowth: this.groupByPeriod(mentorGrowth, period),
      menteeGrowth: this.groupByPeriod(menteeGrowth, period),
    };
  }

  async getSessionStats(period: 'week' | 'month' | 'year') {
    const now = new Date();
    const startDate = this.getStartDate(now, period);

    const sessions = await this.prisma.mentorshipSession.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        status: true,
        duration: true,
      },
    });

    const sessionsByStatus = {
      scheduled: sessions.filter(s => s.status === SessionStatus.SCHEDULED).length,
      completed: sessions.filter(s => s.status === SessionStatus.COMPLETED).length,
      cancelled: sessions.filter(s => s.status === SessionStatus.CANCELLED).length,
      inProgress: sessions.filter(s => s.status === SessionStatus.IN_PROGRESS).length,
    };

    const totalMinutes = sessions
      .filter(s => s.status === SessionStatus.COMPLETED)
      .reduce((sum, s) => sum + s.duration, 0);

    const averageDuration = sessionsByStatus.completed > 0 
      ? Math.round(totalMinutes / sessionsByStatus.completed)
      : 0;

    return {
      period,
      total: sessions.length,
      byStatus: sessionsByStatus,
      totalHours: Math.round(totalMinutes / 60),
      averageDuration,
    };
  }

  async getRevenueStats(period: 'week' | 'month' | 'year') {
    // Since we don't have a payment system yet, we'll simulate revenue
    // based on completed sessions and average session price
    const now = new Date();
    const startDate = this.getStartDate(now, period);
    const averageSessionPrice = 50; // USD

    const completedSessions = await this.prisma.mentorshipSession.count({
      where: {
        status: SessionStatus.COMPLETED,
        completedAt: {
          gte: startDate,
        },
      },
    });

    const revenue = completedSessions * averageSessionPrice;

    // Get revenue by mentor
    const revenueByMentor = await this.prisma.mentorshipSession.groupBy({
      by: ['mentorId'],
      where: {
        status: SessionStatus.COMPLETED,
        completedAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    const topEarners = await Promise.all(
      revenueByMentor
        .sort((a, b) => b._count - a._count)
        .slice(0, 5)
        .map(async (item) => {
          const mentor = await this.prisma.user.findUnique({
            where: { id: item.mentorId },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          });
          return {
            mentor,
            revenue: item._count * averageSessionPrice,
            sessions: item._count,
          };
        })
    );

    return {
      period,
      total: revenue,
      currency: 'USD',
      averagePerSession: averageSessionPrice,
      completedSessions,
      topEarners,
    };
  }

  async getTopMentors(limit: number = 10) {
    // Get mentors with most completed sessions
    const topBySessionCount = await this.prisma.mentorshipSession.groupBy({
      by: ['mentorId'],
      where: {
        status: SessionStatus.COMPLETED,
      },
      _count: true,
      orderBy: {
        _count: {
          mentorId: 'desc',
        },
      },
      take: limit,
    });

    // Get mentor details and ratings
    const mentorsWithStats = await Promise.all(
      topBySessionCount.map(async (item) => {
        const mentor = await this.prisma.user.findUnique({
          where: { id: item.mentorId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
            expertise: true,
            bio: true,
          },
        });

        // Get average rating
        const feedbacks = await this.prisma.sessionFeedback.findMany({
          where: {
            session: {
              mentorId: item.mentorId,
            },
            rating: {
              gt: 0,
            },
          },
          select: {
            rating: true,
          },
        });

        const averageRating = feedbacks.length > 0
          ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
          : 0;

        // Get total hours
        const sessions = await this.prisma.mentorshipSession.aggregate({
          where: {
            mentorId: item.mentorId,
            status: SessionStatus.COMPLETED,
          },
          _sum: {
            duration: true,
          },
        });

        const totalHours = Math.round((sessions._sum.duration || 0) / 60);

        return {
          mentor,
          stats: {
            totalSessions: item._count,
            averageRating: Math.round(averageRating * 10) / 10,
            totalHours,
            totalStudents: await this.getUniqueStudentsCount(item.mentorId),
          },
        };
      })
    );

    return mentorsWithStats;
  }

  async getFeedbackStats() {
    const feedbacks = await this.prisma.sessionFeedback.findMany({
      where: {
        rating: {
          gt: 0,
        },
      },
      select: {
        rating: true,
        createdAt: true,
      },
    });

    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
      : 0;

    const ratingDistribution = {
      1: feedbacks.filter(f => f.rating === 1).length,
      2: feedbacks.filter(f => f.rating === 2).length,
      3: feedbacks.filter(f => f.rating === 3).length,
      4: feedbacks.filter(f => f.rating === 4).length,
      5: feedbacks.filter(f => f.rating === 5).length,
    };

    // Get feedback completion rate
    const completedSessions = await this.prisma.mentorshipSession.count({
      where: { status: SessionStatus.COMPLETED },
    });

    const sessionsWithFeedback = await this.prisma.mentorshipSession.count({
      where: {
        status: SessionStatus.COMPLETED,
        feedback: {
          isNot: null,
        },
      },
    });

    const feedbackCompletionRate = completedSessions > 0
      ? (sessionsWithFeedback / completedSessions) * 100
      : 0;

    return {
      total: totalFeedbacks,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
      completionRate: Math.round(feedbackCompletionRate),
      recentTrend: await this.getFeedbackTrend(),
    };
  }

  async getActivityHeatmap() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sessions = await this.prisma.mentorshipSession.findMany({
      where: {
        scheduledAt: {
          gte: sevenDaysAgo,
          lte: now,
        },
      },
      select: {
        scheduledAt: true,
      },
    });

    // Create heatmap data (hours x days)
    const heatmap: number[][] = Array(24).fill(null).map(() => Array(7).fill(0));

    sessions.forEach(session => {
      const date = new Date(session.scheduledAt);
      const hour = date.getHours();
      const day = date.getDay();
      heatmap[hour][day]++;
    });

    return {
      data: heatmap,
      labels: {
        hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      },
    };
  }

  // Helper methods
  private async getActiveUsersCount(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            mentorSessions: {
              some: {
                createdAt: {
                  gte: thirtyDaysAgo,
                },
              },
            },
          },
          {
            menteeSessions: {
              some: {
                createdAt: {
                  gte: thirtyDaysAgo,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    return activeUsers.length;
  }

  private async calculateTotalRevenue(): Promise<number> {
    // Simulate revenue based on completed sessions
    const completedSessions = await this.prisma.mentorshipSession.count({
      where: { status: SessionStatus.COMPLETED },
    });
    return completedSessions * 50; // $50 per session average
  }

  private async calculateAverageRating(): Promise<number> {
    const feedbacks = await this.prisma.sessionFeedback.findMany({
      where: {
        rating: {
          gt: 0,
        },
      },
      select: {
        rating: true,
      },
    });

    if (feedbacks.length === 0) return 0;

    const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    return Math.round((totalRating / feedbacks.length) * 10) / 10;
  }

  private getStartDate(now: Date, period: 'week' | 'month' | 'year'): Date {
    const startDate = new Date(now);
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    return startDate;
  }

  private groupByPeriod(data: any[], period: 'week' | 'month' | 'year') {
    // This is a simplified grouping - in production, you'd want more sophisticated date grouping
    const grouped: { [key: string]: number } = {};

    data.forEach(item => {
      const date = new Date(item.createdAt);
      let key: string;

      switch (period) {
        case 'week':
          key = date.toISOString().split('T')[0]; // Daily for week view
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // Daily for month view
          break;
        case 'year':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Monthly for year view
          break;
      }

      grouped[key] = (grouped[key] || 0) + item._count;
    });

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }

  private async getUniqueStudentsCount(mentorId: string): Promise<number> {
    const uniqueStudents = await this.prisma.mentorshipSession.findMany({
      where: {
        mentorId,
        status: SessionStatus.COMPLETED,
      },
      select: {
        menteeId: true,
      },
      distinct: ['menteeId'],
    });

    return uniqueStudents.length;
  }

  private async getFeedbackTrend(): Promise<'improving' | 'stable' | 'declining'> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentFeedbacks = await this.prisma.sessionFeedback.aggregate({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        rating: {
          gt: 0,
        },
      },
      _avg: {
        rating: true,
      },
    });

    const olderFeedbacks = await this.prisma.sessionFeedback.aggregate({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
        rating: {
          gt: 0,
        },
      },
      _avg: {
        rating: true,
      },
    });

    const recentAvg = recentFeedbacks._avg.rating || 0;
    const olderAvg = olderFeedbacks._avg.rating || 0;

    if (recentAvg > olderAvg + 0.1) return 'improving';
    if (recentAvg < olderAvg - 0.1) return 'declining';
    return 'stable';
  }
}