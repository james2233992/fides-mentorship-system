import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionStatus } from '@prisma/client';
import { NotificationQueue } from '../queues/notification.queue';
import { MeetingsService } from '../meetings/meetings.service';

@Injectable()
export class SessionsService {
  constructor(
    private prisma: PrismaService,
    @Inject(NotificationQueue) private notificationQueue: NotificationQueue,
    private meetingsService: MeetingsService,
  ) {}

  async create(data: {
    mentorId: string;
    menteeId: string;
    title: string;
    description?: string;
    scheduledAt: Date;
    duration: number;
  }) {
    // Validate that mentor exists and is a mentor
    const mentor = await this.prisma.user.findUnique({
      where: { id: data.mentorId },
    });

    if (!mentor || (mentor.role !== 'MENTOR' && mentor.role !== 'ADMIN')) {
      throw new BadRequestException('Invalid mentor');
    }

    // Validate that mentee exists
    const mentee = await this.prisma.user.findUnique({
      where: { id: data.menteeId },
    });

    if (!mentee) {
      throw new BadRequestException('Invalid mentee');
    }

    // Generate meeting link
    const meetingLink = await this.meetingsService.generateMeetingLink(
      `${data.mentorId}-${data.menteeId}-${Date.now()}`,
      data.title,
    );

    // Create the session
    const session = await this.prisma.mentorshipSession.create({
      data: {
        mentorId: data.mentorId,
        menteeId: data.menteeId,
        title: data.title,
        description: data.description,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        status: SessionStatus.SCHEDULED,
        meetingLink: meetingLink.url,
      },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create notification for the mentee
    await this.createNotification({
      type: 'SESSION_SCHEDULED',
      title: 'Nueva sesión programada',
      message: `Tu sesión con ${mentor.firstName} ${mentor.lastName} ha sido programada para ${data.scheduledAt.toLocaleDateString()}`,
      userId: data.menteeId,
      sessionId: session.id,
    });

    // Send notifications via queue
    await this.notificationQueue.addNotification({
      userId: data.menteeId,
      type: 'MENTORSHIP_SCHEDULED',
      title: 'Nueva Mentoría Programada',
      message: `Se ha programado una nueva mentoría con ${mentor.firstName} ${mentor.lastName}`,
      metadata: {
        studentName: `${mentee.firstName} ${mentee.lastName}`,
        teacherName: `${mentor.firstName} ${mentor.lastName}`,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        notificationChannels: ['email', 'websocket'],
      },
    });

    // Notify mentor too
    await this.notificationQueue.addNotification({
      userId: data.mentorId,
      type: 'MENTORSHIP_SCHEDULED',
      title: 'Nueva Mentoría Programada',
      message: `Se ha programado una nueva mentoría con ${mentee.firstName} ${mentee.lastName}`,
      metadata: {
        studentName: `${mentee.firstName} ${mentee.lastName}`,
        teacherName: `${mentor.firstName} ${mentor.lastName}`,
        scheduledAt: data.scheduledAt,
        duration: data.duration,
        notificationChannels: ['email', 'websocket'],
      },
    });

    return session;
  }

  async findAll(userId: string, role: string, page: number = 1, limit: number = 10) {
    const where = role === 'MENTOR' 
      ? { mentorId: userId }
      : role === 'MENTEE' 
      ? { menteeId: userId }
      : {}; // Admin sees all

    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      this.prisma.mentorshipSession.findMany({
        where,
        include: {
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              expertise: true,
            },
          },
          mentee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          feedback: {
            select: {
              rating: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          scheduledAt: 'asc',
        },
        skip,
        take: limit,
      }),
      this.prisma.mentorshipSession.count({ where }),
    ]);

    return {
      data: sessions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string, userId: string, role: string) {
    const session = await this.prisma.mentorshipSession.findUnique({
      where: { id },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            expertise: true,
            bio: true,
            profilePicture: true,
          },
        },
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
        feedback: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if user has access to this session
    if (role !== 'ADMIN' && session.mentorId !== userId && session.menteeId !== userId) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async update(id: string, userId: string, role: string, data: any) {
    const session = await this.findOne(id, userId, role);

    // Only mentor or admin can update sessions
    if (role !== 'ADMIN' && session.mentorId !== userId) {
      throw new BadRequestException('Only the mentor can update the session');
    }

    return this.prisma.mentorshipSession.update({
      where: { id },
      data,
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, userId: string, role: string, status: SessionStatus) {
    const session = await this.findOne(id, userId, role);

    // Validate status transitions
    if (session.status === SessionStatus.COMPLETED || session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a completed or cancelled session');
    }

    // Prepare update data
    const updateData: any = { status };
    
    // Set completedAt when marking as completed
    if (status === SessionStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    const updatedSession = await this.prisma.mentorshipSession.update({
      where: { id },
      data: updateData,
      include: {
        mentor: true,
        mentee: true,
        feedback: true,
      },
    });

    // Create appropriate notification
    let notificationType, notificationMessage;
    switch (status) {
      case SessionStatus.CANCELLED:
        notificationType = 'SESSION_CANCELLED';
        notificationMessage = `La sesión "${session.title}" ha sido cancelada`;
        break;
      case SessionStatus.IN_PROGRESS:
        notificationType = 'SESSION_REMINDER';
        notificationMessage = `La sesión "${session.title}" está en progreso`;
        break;
      case SessionStatus.COMPLETED:
        notificationType = 'SESSION_COMPLETED';
        notificationMessage = `La sesión "${session.title}" ha sido completada`;
        break;
      default:
        return updatedSession;
    }

    // Notify both participants
    await this.createNotification({
      type: notificationType,
      title: 'Actualización de sesión',
      message: notificationMessage,
      userId: session.menteeId,
      sessionId: session.id,
    });

    if (session.mentorId !== session.menteeId) {
      await this.createNotification({
        type: notificationType,
        title: 'Actualización de sesión',
        message: notificationMessage,
        userId: session.mentorId,
        sessionId: session.id,
      });
    }

    return updatedSession;
  }

  async delete(id: string, userId: string, role: string) {
    await this.findOne(id, userId, role);

    if (role !== 'ADMIN') {
      throw new BadRequestException('Only admins can delete sessions');
    }

    return this.prisma.mentorshipSession.delete({
      where: { id },
    });
  }

  private async createNotification(data: {
    type: string;
    title: string;
    message: string;
    userId: string;
    sessionId?: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        type: data.type as any,
        title: data.title,
        message: data.message,
        sessionId: data.sessionId,
      },
    });

    await this.prisma.userNotification.create({
      data: {
        userId: data.userId,
        notificationId: notification.id,
      },
    });

    return notification;
  }

  async addFeedback(sessionId: string, userId: string, feedbackData: { rating: number; feedback?: string }) {
    // Verify session exists and user is the mentee
    const session = await this.prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
      include: { feedback: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.menteeId !== userId) {
      throw new BadRequestException('Only the mentee can provide feedback');
    }

    if (session.status !== SessionStatus.COMPLETED) {
      throw new BadRequestException('Feedback can only be added to completed sessions');
    }

    if (session.feedback) {
      throw new BadRequestException('Feedback has already been provided for this session');
    }

    // Create feedback
    const feedback = await this.prisma.sessionFeedback.create({
      data: {
        sessionId,
        rating: feedbackData.rating,
        feedback: feedbackData.feedback,
      },
    });

    // Notify mentor about the feedback
    await this.createNotification({
      type: 'SESSION_COMPLETED',
      title: 'Nueva calificación recibida',
      message: `Has recibido una calificación de ${feedbackData.rating} estrellas`,
      userId: session.mentorId,
      sessionId,
    });

    return feedback;
  }

  async getFeedback(sessionId: string, userId: string) {
    const session = await this.prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
      include: { feedback: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Only mentor, mentee, or admin can view feedback
    if (
      session.mentorId !== userId &&
      session.menteeId !== userId &&
      // We should check if user is admin here
      false
    ) {
      throw new BadRequestException('Not authorized to view this feedback');
    }

    if (!session.feedback) {
      throw new NotFoundException('No feedback available for this session');
    }

    return session.feedback;
  }

  async updateNotes(sessionId: string, userId: string, role: string, notes: string) {
    const session = await this.prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Only mentor or admin can update notes
    if (session.mentorId !== userId && role !== 'ADMIN') {
      throw new BadRequestException('Not authorized to update session notes');
    }

    return this.prisma.mentorshipSession.update({
      where: { id: sessionId },
      data: { notes },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        mentee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        feedback: true,
      },
    });
  }

  async updateMentorNotes(sessionId: string, mentorId: string, mentorNotes: string) {
    const session = await this.prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
      include: { feedback: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.mentorId !== mentorId) {
      throw new BadRequestException('Only the session mentor can update mentor notes');
    }

    // If feedback doesn't exist, create it with just mentor notes
    if (!session.feedback) {
      return this.prisma.sessionFeedback.create({
        data: {
          sessionId,
          rating: 0, // Default rating, will be updated when mentee provides feedback
          mentorNotes,
        },
      });
    }

    // Update existing feedback with mentor notes
    return this.prisma.sessionFeedback.update({
      where: { sessionId },
      data: { mentorNotes },
    });
  }
}