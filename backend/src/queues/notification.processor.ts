import { WorkerHost } from '@nestjs/bullmq';
import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject } from '@nestjs/common';
import { NotificationJobData } from './notification.queue';
import { EmailService } from '../notifications/services/email.service';
import { SmsService } from '../notifications/services/sms.service';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketsGateway } from '../websockets/websockets.gateway';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(SmsService) private readonly smsService: SmsService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(WebSocketsGateway) private readonly websocketsGateway: WebSocketsGateway,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<any> {
    this.logger.log(`Processing notification job ${job.id}`);
    const { userId, type, title, message, metadata } = job.data;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, phone: true, firstName: true, lastName: true },
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const results = {
        email: false,
        sms: false,
        websocket: false,
      };

      if (metadata?.notificationChannels?.includes('email') && user.email) {
        try {
          await this.sendEmailNotification(user.email, type, title, message, metadata);
          results.email = true;
        } catch (error) {
          this.logger.error(`Failed to send email notification: ${error.message}`);
        }
      }

      if (metadata?.notificationChannels?.includes('sms') && user.phone) {
        try {
          await this.sendSmsNotification(user.phone, type, title, message, metadata);
          results.sms = true;
        } catch (error) {
          this.logger.error(`Failed to send SMS notification: ${error.message}`);
        }
      }

      if (metadata?.notificationChannels?.includes('websocket')) {
        try {
          this.websocketsGateway.sendNotificationToUser(userId, {
            type,
            title,
            message,
            metadata,
            timestamp: new Date(),
          });
          results.websocket = true;
        } catch (error) {
          this.logger.error(`Failed to send WebSocket notification: ${error.message}`);
        }
      }

      const notification = await this.prisma.notification.create({
        data: {
          type: type.toUpperCase().replace(/-/g, '_') as any,
          title,
          message,
          metadata: metadata || {},
          status: 'sent',
          sentAt: new Date(),
        },
      });

      await this.prisma.userNotification.create({
        data: {
          userId,
          notificationId: notification.id,
        },
      });

      this.logger.log(`Notification sent successfully to user ${userId}. Results: ${JSON.stringify(results)}`);
      return { success: true, jobId: job.id, results };
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
      
      const notification = await this.prisma.notification.create({
        data: {
          type: type.toUpperCase().replace(/-/g, '_') as any,
          title,
          message,
          metadata: metadata || {},
          status: 'failed',
        },
      });

      await this.prisma.userNotification.create({
        data: {
          userId,
          notificationId: notification.id,
        },
      });

      throw error;
    }
  }

  private async sendEmailNotification(
    email: string,
    type: string,
    title: string,
    message: string,
    metadata: any,
  ): Promise<void> {
    switch (type) {
      case 'MENTORSHIP_SCHEDULED':
        await this.emailService.sendMentorshipScheduledEmail(email, {
          studentName: metadata.studentName,
          teacherName: metadata.teacherName,
          scheduledAt: new Date(metadata.scheduledAt),
          duration: metadata.duration,
          meetingLink: metadata.meetingLink,
        });
        break;

      case 'MENTORSHIP_REMINDER':
        await this.emailService.sendMentorshipReminderEmail(email, {
          studentName: metadata.studentName,
          teacherName: metadata.teacherName,
          scheduledAt: new Date(metadata.scheduledAt),
          duration: metadata.duration,
          meetingLink: metadata.meetingLink,
        });
        break;

      case 'MENTORSHIP_CANCELLED':
        await this.emailService.sendMentorshipCancelledEmail(email, {
          studentName: metadata.studentName,
          teacherName: metadata.teacherName,
          scheduledAt: new Date(metadata.scheduledAt),
          reason: metadata.reason,
        });
        break;

      default:
        await this.emailService.sendEmail({
          to: email,
          subject: title,
          text: message,
          html: `<p>${message}</p>`,
        });
    }
  }

  private async sendSmsNotification(
    phone: string,
    type: string,
    title: string,
    message: string,
    metadata: any,
  ): Promise<void> {
    const formattedPhone = this.smsService.formatPhoneNumber(phone);

    switch (type) {
      case 'MENTORSHIP_SCHEDULED':
        await this.smsService.sendMentorshipScheduledSms(formattedPhone, {
          studentName: metadata.studentName,
          teacherName: metadata.teacherName,
          scheduledAt: new Date(metadata.scheduledAt),
          duration: metadata.duration,
        });
        break;

      case 'MENTORSHIP_REMINDER':
        await this.smsService.sendMentorshipReminderSms(formattedPhone, {
          studentName: metadata.studentName,
          teacherName: metadata.teacherName,
          scheduledAt: new Date(metadata.scheduledAt),
        });
        break;

      case 'MENTORSHIP_CANCELLED':
        await this.smsService.sendMentorshipCancelledSms(formattedPhone, {
          studentName: metadata.studentName,
          teacherName: metadata.teacherName,
          scheduledAt: new Date(metadata.scheduledAt),
        });
        break;

      default:
        await this.smsService.sendSms({
          to: formattedPhone,
          body: `${title}: ${message}`,
        });
    }
  }
}