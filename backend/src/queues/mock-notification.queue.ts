import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../notifications/services/email.service';
import { SmsService } from '../notifications/services/sms.service';
import { WebSocketsGateway } from '../websockets/websockets.gateway';

@Injectable()
export class MockNotificationQueue {
  private readonly logger = new Logger(MockNotificationQueue.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly webSocketsGateway: WebSocketsGateway,
  ) {}

  async addNotification(data: any): Promise<void> {
    this.logger.log('Mock queue: Processing notification immediately');
    
    try {
      // Process the notification immediately instead of queuing
      const { userId, type, title, message, metadata } = data;
      
      // Send via WebSocket
      this.webSocketsGateway.sendNotificationToUser(userId, {
        type,
        title,
        message,
        timestamp: new Date(),
      });

      // Send email if configured
      if (metadata?.notificationChannels?.includes('email') && metadata?.email) {
        await this.processEmailNotification(type, metadata);
      }

      // Send SMS if configured
      if (metadata?.notificationChannels?.includes('sms') && metadata?.phone) {
        await this.processSmsNotification(type, metadata);
      }
    } catch (error) {
      this.logger.error('Failed to process notification:', error);
    }
  }

  private async processEmailNotification(type: string, metadata: any) {
    switch (type) {
      case 'MENTORSHIP_SCHEDULED':
        await this.emailService.sendMentorshipScheduledEmail(
          metadata.email,
          {
            studentName: metadata.studentName,
            teacherName: metadata.teacherName,
            scheduledAt: metadata.scheduledAt,
            duration: metadata.duration,
            meetingLink: metadata.meetingLink,
          },
        );
        break;
      case 'MENTORSHIP_REMINDER':
        await this.emailService.sendMentorshipReminderEmail(
          metadata.email,
          {
            studentName: metadata.studentName,
            teacherName: metadata.teacherName,
            scheduledAt: metadata.scheduledAt,
            duration: metadata.duration,
            meetingLink: metadata.meetingLink,
          },
        );
        break;
      case 'MENTORSHIP_CANCELLED':
        await this.emailService.sendMentorshipCancelledEmail(
          metadata.email,
          {
            studentName: metadata.studentName,
            teacherName: metadata.teacherName,
            scheduledAt: metadata.scheduledAt,
          },
        );
        break;
    }
  }

  private async processSmsNotification(type: string, metadata: any) {
    const formattedPhone = this.smsService.formatPhoneNumber(metadata.phone);
    
    switch (type) {
      case 'MENTORSHIP_SCHEDULED':
        await this.smsService.sendMentorshipScheduledSms(
          formattedPhone,
          {
            studentName: metadata.studentName,
            teacherName: metadata.teacherName,
            scheduledAt: metadata.scheduledAt,
            duration: metadata.duration,
          },
        );
        break;
      case 'MENTORSHIP_REMINDER':
        await this.smsService.sendMentorshipReminderSms(
          formattedPhone,
          {
            studentName: metadata.studentName,
            teacherName: metadata.teacherName,
            scheduledAt: metadata.scheduledAt,
          },
        );
        break;
      case 'MENTORSHIP_CANCELLED':
        await this.smsService.sendMentorshipCancelledSms(
          formattedPhone,
          {
            studentName: metadata.studentName,
            teacherName: metadata.teacherName,
            scheduledAt: metadata.scheduledAt,
          },
        );
        break;
    }
  }
}