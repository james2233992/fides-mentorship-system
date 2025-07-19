import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationQueue } from './notification.queue';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class ReminderProcessor {
  private readonly logger = new Logger(ReminderProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationQueue: NotificationQueue,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendSessionReminders() {
    this.logger.log('Checking for upcoming sessions to send reminders...');
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const upcomingSessions = await this.prisma.mentorshipSession.findMany({
      where: {
        status: SessionStatus.SCHEDULED,
        scheduledAt: {
          gte: tomorrow,
          lt: new Date(tomorrow.getTime() + 60 * 60 * 1000), // Next hour
        },
      },
      include: {
        mentor: true,
        mentee: true,
      },
    });

    this.logger.log(`Found ${upcomingSessions.length} sessions to remind`);

    for (const session of upcomingSessions) {
      try {
        // Send reminder to mentee
        await this.notificationQueue.addNotification({
          userId: session.menteeId,
          type: 'MENTORSHIP_REMINDER',
          title: 'Recordatorio de Mentoría',
          message: `Tu mentoría con ${session.mentor.firstName} ${session.mentor.lastName} es mañana`,
          metadata: {
            sessionId: session.id,
            studentName: `${session.mentee.firstName} ${session.mentee.lastName}`,
            teacherName: `${session.mentor.firstName} ${session.mentor.lastName}`,
            scheduledAt: session.scheduledAt,
            duration: session.duration,
            meetingLink: session.meetingLink,
            notificationChannels: ['email', 'sms', 'websocket'],
          },
        });

        // Send reminder to mentor
        await this.notificationQueue.addNotification({
          userId: session.mentorId,
          type: 'MENTORSHIP_REMINDER',
          title: 'Recordatorio de Mentoría',
          message: `Tu mentoría con ${session.mentee.firstName} ${session.mentee.lastName} es mañana`,
          metadata: {
            sessionId: session.id,
            studentName: `${session.mentee.firstName} ${session.mentee.lastName}`,
            teacherName: `${session.mentor.firstName} ${session.mentor.lastName}`,
            scheduledAt: session.scheduledAt,
            duration: session.duration,
            meetingLink: session.meetingLink,
            notificationChannels: ['email', 'sms', 'websocket'],
          },
        });

        this.logger.log(`Reminders sent for session ${session.id}`);
      } catch (error) {
        this.logger.error(`Failed to send reminder for session ${session.id}:`, error);
      }
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkSessionStart() {
    this.logger.log('Checking for sessions starting soon...');
    
    const now = new Date();
    const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);
    
    const startingSessions = await this.prisma.mentorshipSession.findMany({
      where: {
        status: SessionStatus.SCHEDULED,
        scheduledAt: {
          gte: now,
          lt: in15Minutes,
        },
      },
      include: {
        mentor: true,
        mentee: true,
      },
    });

    this.logger.log(`Found ${startingSessions.length} sessions starting soon`);

    for (const session of startingSessions) {
      try {
        // Send immediate reminder
        await this.notificationQueue.addNotification({
          userId: session.menteeId,
          type: 'SESSION_STARTING',
          title: '¡Tu mentoría comienza pronto!',
          message: `Tu mentoría con ${session.mentor.firstName} ${session.mentor.lastName} comienza en 15 minutos`,
          metadata: {
            sessionId: session.id,
            meetingLink: session.meetingLink,
            notificationChannels: ['websocket'],
          },
        });

        await this.notificationQueue.addNotification({
          userId: session.mentorId,
          type: 'SESSION_STARTING',
          title: '¡Tu mentoría comienza pronto!',
          message: `Tu mentoría con ${session.mentee.firstName} ${session.mentee.lastName} comienza en 15 minutos`,
          metadata: {
            sessionId: session.id,
            meetingLink: session.meetingLink,
            notificationChannels: ['websocket'],
          },
        });

        this.logger.log(`Starting soon notifications sent for session ${session.id}`);
      } catch (error) {
        this.logger.error(`Failed to send starting soon notification for session ${session.id}:`, error);
      }
    }
  }

  @Cron('0 9 * * 1') // Every Monday at 9 AM
  async sendWeeklySummary() {
    this.logger.log('Sending weekly session summaries...');
    
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    const mentors = await this.prisma.user.findMany({
      where: {
        role: { in: ['MENTOR', 'ADMIN'] },
      },
      include: {
        mentorSessions: {
          where: {
            scheduledAt: {
              gte: startOfWeek,
              lt: endOfWeek,
            },
          },
          include: {
            mentee: true,
          },
        },
      },
    });

    for (const mentor of mentors) {
      if (mentor.mentorSessions.length > 0) {
        const sessionList = mentor.mentorSessions
          .map(s => `- ${s.mentee.firstName} ${s.mentee.lastName} - ${new Date(s.scheduledAt).toLocaleDateString('es-ES')}`)
          .join('\n');

        await this.notificationQueue.addNotification({
          userId: mentor.id,
          type: 'WEEKLY_SUMMARY',
          title: 'Resumen Semanal de Mentorías',
          message: `Tienes ${mentor.mentorSessions.length} mentorías esta semana:\n${sessionList}`,
          metadata: {
            notificationChannels: ['email'],
          },
        });
      }
    }
  }
}