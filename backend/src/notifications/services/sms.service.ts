import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

export interface SmsOptions {
  to: string;
  body: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: Twilio;
  private enabled: boolean;

  constructor() {
    const hasValidCredentials = 
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER &&
      process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
      process.env.TWILIO_ACCOUNT_SID !== 'your-twilio-account-sid';

    this.enabled = !!hasValidCredentials;

    if (this.enabled) {
      try {
        this.twilioClient = new Twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN,
        );
        this.logger.log('SMS service enabled with Twilio');
      } catch (error) {
        this.logger.error('Failed to initialize Twilio client:', error);
        this.enabled = false;
      }
    } else {
      this.logger.warn('SMS service disabled - missing or invalid Twilio credentials');
    }
  }

  async sendSms(options: SmsOptions): Promise<boolean> {
    if (!this.enabled) {
      this.logger.warn(`SMS service disabled. Would send to ${options.to}: ${options.body}`);
      return true;
    }

    try {
      const message = await this.twilioClient.messages.create({
        body: options.body,
        to: options.to,
        from: process.env.TWILIO_PHONE_NUMBER,
      });

      this.logger.log(`SMS sent successfully to ${options.to}. SID: ${message.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${options.to}:`, error);
      throw error;
    }
  }

  async sendMentorshipScheduledSms(
    to: string,
    mentorshipDetails: {
      studentName: string;
      teacherName: string;
      scheduledAt: Date;
      duration: number;
    },
  ): Promise<boolean> {
    const scheduledDate = new Date(mentorshipDetails.scheduledAt);
    const formattedDate = scheduledDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
    });
    const formattedTime = scheduledDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const body = `FIDES: Nueva mentoría programada
${mentorshipDetails.studentName} con ${mentorshipDetails.teacherName}
Fecha: ${formattedDate} a las ${formattedTime}
Duración: ${mentorshipDetails.duration} min`;

    return this.sendSms({ to, body });
  }

  async sendMentorshipReminderSms(
    to: string,
    mentorshipDetails: {
      studentName: string;
      teacherName: string;
      scheduledAt: Date;
    },
  ): Promise<boolean> {
    const scheduledDate = new Date(mentorshipDetails.scheduledAt);
    const formattedTime = scheduledDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const body = `FIDES RECORDATORIO: Mentoría mañana a las ${formattedTime}
${mentorshipDetails.studentName} con ${mentorshipDetails.teacherName}`;

    return this.sendSms({ to, body });
  }

  async sendMentorshipCancelledSms(
    to: string,
    mentorshipDetails: {
      studentName: string;
      teacherName: string;
      scheduledAt: Date;
    },
  ): Promise<boolean> {
    const scheduledDate = new Date(mentorshipDetails.scheduledAt);
    const formattedDate = scheduledDate.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
    });

    const body = `FIDES: Mentoría CANCELADA
${mentorshipDetails.studentName} con ${mentorshipDetails.teacherName}
Fecha original: ${formattedDate}`;

    return this.sendSms({ to, body });
  }

  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('57') && cleaned.length === 12) {
      return `+${cleaned}`;
    }
    
    if (cleaned.length === 10) {
      return `+57${cleaned}`;
    }
    
    if (cleaned.startsWith('+')) {
      return phone;
    }
    
    return `+${cleaned}`;
  }
}