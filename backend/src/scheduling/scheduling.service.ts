import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { SchedulingQueue } from '../queues/scheduling.queue';
import { NotificationQueue } from '../queues/notification.queue';
import { SessionStatus } from '@prisma/client';

@Injectable()
export class SchedulingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulingQueue: SchedulingQueue,
    private readonly notificationQueue: NotificationQueue,
  ) {}

  async createSession(createSessionDto: CreateSessionDto) {
    // Check if both users exist
    const [mentor, mentee] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: createSessionDto.mentorId } }),
      this.prisma.user.findUnique({ where: { id: createSessionDto.menteeId } }),
    ]);

    if (!mentor || !mentee) {
      throw new NotFoundException('Mentor or mentee not found');
    }

    // Create the session
    const session = await this.prisma.mentorshipSession.create({
      data: createSessionDto,
      include: {
        mentor: true,
        mentee: true,
      },
    });

    // Schedule reminders
    const reminderTime = new Date(session.scheduledAt);
    reminderTime.setHours(reminderTime.getHours() - 1); // 1 hour before

    await this.schedulingQueue.addSchedulingJob({
      sessionId: session.id,
      type: 'reminder',
      scheduledFor: reminderTime,
      metadata: {
        mentorId: session.mentorId,
        menteeId: session.menteeId,
      },
    });

    // Send notifications
    await this.notificationQueue.addBulkNotificationJob([
      {
        userId: session.mentorId,
        type: 'SESSION_SCHEDULED',
        title: 'New Session Scheduled',
        message: `Session with ${mentee.firstName} ${mentee.lastName} scheduled for ${session.scheduledAt}`,
        metadata: { sessionId: session.id },
      },
      {
        userId: session.menteeId,
        type: 'SESSION_SCHEDULED',
        title: 'New Session Scheduled',
        message: `Session with ${mentor.firstName} ${mentor.lastName} scheduled for ${session.scheduledAt}`,
        metadata: { sessionId: session.id },
      },
    ]);

    return session;
  }

  async findAllSessions(userId?: string, role?: string) {
    const where = userId
      ? role === 'MENTOR'
        ? { mentorId: userId }
        : { menteeId: userId }
      : {};

    return this.prisma.mentorshipSession.findMany({
      where,
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
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
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    });
  }

  async findOneSession(id: string) {
    const session = await this.prisma.mentorshipSession.findUnique({
      where: { id },
      include: {
        mentor: true,
        mentee: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return session;
  }

  async updateSession(id: string, updateSessionDto: UpdateSessionDto, userId: string) {
    const session = await this.findOneSession(id);

    // Check if user is authorized to update
    if (session.mentorId !== userId && session.menteeId !== userId) {
      throw new ForbiddenException('You are not authorized to update this session');
    }

    const updatedSession = await this.prisma.mentorshipSession.update({
      where: { id },
      data: updateSessionDto,
      include: {
        mentor: true,
        mentee: true,
      },
    });

    // If session is rescheduled, send notifications
    if (updateSessionDto.scheduledAt && updateSessionDto.scheduledAt !== session.scheduledAt) {
      await this.notificationQueue.addBulkNotificationJob([
        {
          userId: session.mentorId,
          type: 'SESSION_RESCHEDULED',
          title: 'Session Rescheduled',
          message: `Session has been rescheduled to ${updatedSession.scheduledAt}`,
          metadata: { sessionId: session.id },
        },
        {
          userId: session.menteeId,
          type: 'SESSION_RESCHEDULED',
          title: 'Session Rescheduled',
          message: `Session has been rescheduled to ${updatedSession.scheduledAt}`,
          metadata: { sessionId: session.id },
        },
      ]);
    }

    return updatedSession;
  }

  async cancelSession(id: string, userId: string) {
    const session = await this.findOneSession(id);

    // Check if user is authorized to cancel
    if (session.mentorId !== userId && session.menteeId !== userId) {
      throw new ForbiddenException('You are not authorized to cancel this session');
    }

    const cancelledSession = await this.prisma.mentorshipSession.update({
      where: { id },
      data: { status: SessionStatus.CANCELLED },
      include: {
        mentor: true,
        mentee: true,
      },
    });

    // Send cancellation notifications
    await this.notificationQueue.addBulkNotificationJob([
      {
        userId: session.mentorId,
        type: 'SESSION_CANCELLED',
        title: 'Session Cancelled',
        message: 'Your session has been cancelled',
        metadata: { sessionId: session.id },
      },
      {
        userId: session.menteeId,
        type: 'SESSION_CANCELLED',
        title: 'Session Cancelled',
        message: 'Your session has been cancelled',
        metadata: { sessionId: session.id },
      },
    ]);

    return cancelledSession;
  }

  // Availability methods
  async createAvailability(userId: string, createAvailabilityDto: CreateAvailabilityDto) {
    return this.prisma.availability.create({
      data: {
        ...createAvailabilityDto,
        userId,
      },
    });
  }

  async findUserAvailability(userId: string) {
    return this.prisma.availability.findMany({
      where: { userId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async updateAvailability(id: string, userId: string, updateData: Partial<CreateAvailabilityDto>) {
    const availability = await this.prisma.availability.findUnique({
      where: { id },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (availability.userId !== userId) {
      throw new ForbiddenException('You are not authorized to update this availability');
    }

    return this.prisma.availability.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteAvailability(id: string, userId: string) {
    const availability = await this.prisma.availability.findUnique({
      where: { id },
    });

    if (!availability) {
      throw new NotFoundException('Availability not found');
    }

    if (availability.userId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this availability');
    }

    return this.prisma.availability.delete({
      where: { id },
    });
  }
}