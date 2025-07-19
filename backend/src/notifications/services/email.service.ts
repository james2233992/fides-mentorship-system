import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: any;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private useSendGrid: boolean;

  constructor() {
    this.useSendGrid = !!process.env.SENDGRID_API_KEY;
    
    if (this.useSendGrid) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
      this.logger.log('Using SendGrid for email delivery');
    } else {
      if (process.env.NODE_ENV === 'production') {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: process.env.ETHEREAL_USER || 'test@ethereal.email',
            pass: process.env.ETHEREAL_PASS || 'testpass',
          },
        });
      }
      this.logger.log('Using SMTP for email delivery');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (this.useSendGrid) {
        const msg: any = {
          to: options.to,
          from: process.env.EMAIL_FROM || 'noreply@fides.edu',
          subject: options.subject,
        };

        if (options.templateId) {
          msg.templateId = options.templateId;
          msg.dynamicTemplateData = options.dynamicTemplateData;
        } else {
          msg.text = options.text;
          msg.html = options.html;
        }

        await sgMail.send(msg);
        this.logger.log(`Email sent successfully via SendGrid to ${options.to}`);
      } else {
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'FIDES <noreply@fides.edu>',
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        };

        const info = await this.transporter.sendMail(mailOptions);
        this.logger.log(`Email sent successfully via SMTP to ${options.to}`);
        
        if (process.env.NODE_ENV !== 'production') {
          this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  async sendMentorshipScheduledEmail(
    to: string,
    mentorshipDetails: {
      studentName: string;
      teacherName: string;
      scheduledAt: Date;
      duration: number;
      meetingLink?: string;
    },
  ): Promise<boolean> {
    const subject = 'Nueva Mentoría Programada - FIDES';
    const scheduledDate = new Date(mentorshipDetails.scheduledAt);
    const formattedDate = scheduledDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = scheduledDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a8a;">Nueva Mentoría Programada</h2>
        <p>Estimado/a,</p>
        <p>Se ha programado una nueva mentoría con los siguientes detalles:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Estudiante:</strong> ${mentorshipDetails.studentName}</p>
          <p><strong>Profesor:</strong> ${mentorshipDetails.teacherName}</p>
          <p><strong>Fecha:</strong> ${formattedDate}</p>
          <p><strong>Hora:</strong> ${formattedTime}</p>
          <p><strong>Duración:</strong> ${mentorshipDetails.duration} minutos</p>
          ${mentorshipDetails.meetingLink ? `<p><strong>Enlace de reunión:</strong> <a href="${mentorshipDetails.meetingLink}">${mentorshipDetails.meetingLink}</a></p>` : ''}
        </div>
        <p>Por favor, asegúrese de estar disponible en el horario indicado.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Este es un mensaje automático del sistema de mentorías FIDES. Por favor, no responda a este correo.</p>
      </div>
    `;

    const text = `
Nueva Mentoría Programada - FIDES

Se ha programado una nueva mentoría con los siguientes detalles:

Estudiante: ${mentorshipDetails.studentName}
Profesor: ${mentorshipDetails.teacherName}
Fecha: ${formattedDate}
Hora: ${formattedTime}
Duración: ${mentorshipDetails.duration} minutos
${mentorshipDetails.meetingLink ? `Enlace de reunión: ${mentorshipDetails.meetingLink}` : ''}

Por favor, asegúrese de estar disponible en el horario indicado.

Este es un mensaje automático del sistema de mentorías FIDES.
    `;

    return this.sendEmail({ to, subject, text, html });
  }

  async sendMentorshipReminderEmail(
    to: string,
    mentorshipDetails: {
      studentName: string;
      teacherName: string;
      scheduledAt: Date;
      duration: number;
      meetingLink?: string;
    },
  ): Promise<boolean> {
    const subject = 'Recordatorio: Mentoría Próxima - FIDES';
    const scheduledDate = new Date(mentorshipDetails.scheduledAt);
    const formattedTime = scheduledDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⏰ Recordatorio: Mentoría en 24 horas</h2>
        <p>Estimado/a,</p>
        <p>Le recordamos que tiene una mentoría programada para mañana:</p>
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p><strong>Estudiante:</strong> ${mentorshipDetails.studentName}</p>
          <p><strong>Profesor:</strong> ${mentorshipDetails.teacherName}</p>
          <p><strong>Hora:</strong> ${formattedTime}</p>
          <p><strong>Duración:</strong> ${mentorshipDetails.duration} minutos</p>
          ${mentorshipDetails.meetingLink ? `<p><strong>Enlace de reunión:</strong> <a href="${mentorshipDetails.meetingLink}">${mentorshipDetails.meetingLink}</a></p>` : ''}
        </div>
        <p>Por favor, confirme su asistencia o reprograme si es necesario.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Este es un mensaje automático del sistema de mentorías FIDES.</p>
      </div>
    `;

    const text = `
Recordatorio: Mentoría Próxima - FIDES

Le recordamos que tiene una mentoría programada para mañana:

Estudiante: ${mentorshipDetails.studentName}
Profesor: ${mentorshipDetails.teacherName}
Hora: ${formattedTime}
Duración: ${mentorshipDetails.duration} minutos
${mentorshipDetails.meetingLink ? `Enlace de reunión: ${mentorshipDetails.meetingLink}` : ''}

Por favor, confirme su asistencia o reprograme si es necesario.

Este es un mensaje automático del sistema de mentorías FIDES.
    `;

    return this.sendEmail({ to, subject, text, html });
  }

  async sendMentorshipCancelledEmail(
    to: string,
    mentorshipDetails: {
      studentName: string;
      teacherName: string;
      scheduledAt: Date;
      reason?: string;
    },
  ): Promise<boolean> {
    const subject = 'Mentoría Cancelada - FIDES';
    const scheduledDate = new Date(mentorshipDetails.scheduledAt);
    const formattedDate = scheduledDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = scheduledDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">❌ Mentoría Cancelada</h2>
        <p>Estimado/a,</p>
        <p>Le informamos que la siguiente mentoría ha sido cancelada:</p>
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Estudiante:</strong> ${mentorshipDetails.studentName}</p>
          <p><strong>Profesor:</strong> ${mentorshipDetails.teacherName}</p>
          <p><strong>Fecha original:</strong> ${formattedDate}</p>
          <p><strong>Hora original:</strong> ${formattedTime}</p>
          ${mentorshipDetails.reason ? `<p><strong>Motivo:</strong> ${mentorshipDetails.reason}</p>` : ''}
        </div>
        <p>Por favor, coordine una nueva fecha si es necesario.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Este es un mensaje automático del sistema de mentorías FIDES.</p>
      </div>
    `;

    const text = `
Mentoría Cancelada - FIDES

Le informamos que la siguiente mentoría ha sido cancelada:

Estudiante: ${mentorshipDetails.studentName}
Profesor: ${mentorshipDetails.teacherName}
Fecha original: ${formattedDate}
Hora original: ${formattedTime}
${mentorshipDetails.reason ? `Motivo: ${mentorshipDetails.reason}` : ''}

Por favor, coordine una nueva fecha si es necesario.

Este es un mensaje automático del sistema de mentorías FIDES.
    `;

    return this.sendEmail({ to, subject, text, html });
  }
}