import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateMentorshipRequestDto } from './dto/create-mentorship-request.dto';
import { UpdateMentorshipRequestStatusDto } from './dto/update-mentorship-request-status.dto';
import { MentorshipRequestResponseDto } from './dto/mentorship-request-response.dto';
import { RequestStatus, NotificationType, UserRole } from '@prisma/client';

@Injectable()
export class MentorshipRequestsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    menteeId: string,
    createDto: CreateMentorshipRequestDto,
  ): Promise<MentorshipRequestResponseDto> {
    // Validate that the mentor exists and is actually a mentor
    const mentor = await this.prisma.user.findFirst({
      where: {
        id: createDto.mentorId,
        role: { in: [UserRole.MENTOR, UserRole.ADMIN] },
      },
    });

    if (!mentor) {
      throw new NotFoundException('Mentor not found or user is not a mentor');
    }

    // Check if mentee already has a pending request with this mentor
    const existingRequest = await this.prisma.mentorshipRequest.findFirst({
      where: {
        menteeId,
        mentorId: createDto.mentorId,
        status: RequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException(
        'You already have a pending request with this mentor',
      );
    }

    // Create the mentorship request
    const request = await this.prisma.mentorshipRequest.create({
      data: {
        menteeId,
        mentorId: createDto.mentorId,
        message: createDto.message,
      },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            expertise: true,
            bio: true,
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

    // Send notification to mentor
    await this.notificationsService.create({
      userId: mentor.id,
      type: NotificationType.SESSION_SCHEDULED,
      title: 'Nueva solicitud de mentoría',
      message: `${request.mentee.firstName} ${request.mentee.lastName} ha solicitado una mentoría contigo`,
      senderId: menteeId,
    });

    return this.mapToResponseDto(request);
  }

  async findAll(userId: string, role: UserRole): Promise<MentorshipRequestResponseDto[]> {
    const where = role === UserRole.MENTEE 
      ? { menteeId: userId }
      : { mentorId: userId };

    const requests = await this.prisma.mentorshipRequest.findMany({
      where,
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            expertise: true,
            bio: true,
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
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(request => this.mapToResponseDto(request));
  }

  async findOne(id: string, userId: string): Promise<MentorshipRequestResponseDto> {
    const request = await this.prisma.mentorshipRequest.findFirst({
      where: {
        id,
        OR: [
          { menteeId: userId },
          { mentorId: userId },
        ],
      },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            expertise: true,
            bio: true,
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

    if (!request) {
      throw new NotFoundException('Mentorship request not found');
    }

    return this.mapToResponseDto(request);
  }

  async updateStatus(
    id: string,
    mentorId: string,
    updateDto: UpdateMentorshipRequestStatusDto,
  ): Promise<MentorshipRequestResponseDto> {
    // Find the request and verify the mentor
    const request = await this.prisma.mentorshipRequest.findFirst({
      where: {
        id,
        mentorId,
      },
      include: {
        mentee: true,
        mentor: true,
      },
    });

    if (!request) {
      throw new NotFoundException('Mentorship request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be updated');
    }

    // Update the request status
    const updatedRequest = await this.prisma.mentorshipRequest.update({
      where: { id },
      data: { status: updateDto.status },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            expertise: true,
            bio: true,
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

    // Send notification to mentee
    const notificationType = updateDto.status === RequestStatus.ACCEPTED
      ? NotificationType.SESSION_SCHEDULED
      : NotificationType.SESSION_CANCELLED;

    const notificationMessage = updateDto.status === RequestStatus.ACCEPTED
      ? `${request.mentor.firstName} ${request.mentor.lastName} ha aceptado tu solicitud de mentoría`
      : `${request.mentor.firstName} ${request.mentor.lastName} ha rechazado tu solicitud de mentoría`;

    await this.notificationsService.create({
      userId: request.menteeId,
      type: notificationType,
      title: updateDto.status === RequestStatus.ACCEPTED ? 'Solicitud aceptada' : 'Solicitud rechazada',
      message: notificationMessage,
      senderId: mentorId,
    });

    // If accepted, we could optionally create an initial session here
    // This would depend on business requirements

    return this.mapToResponseDto(updatedRequest);
  }

  async cancel(id: string, menteeId: string): Promise<void> {
    const request = await this.prisma.mentorshipRequest.findFirst({
      where: {
        id,
        menteeId,
        status: RequestStatus.PENDING,
      },
    });

    if (!request) {
      throw new NotFoundException('Mentorship request not found or cannot be cancelled');
    }

    await this.prisma.mentorshipRequest.delete({
      where: { id },
    });

    // Notify the mentor about the cancellation
    await this.notificationsService.create({
      userId: request.mentorId,
      type: NotificationType.SESSION_CANCELLED,
      title: 'Solicitud cancelada',
      message: 'El mentee ha cancelado su solicitud de mentoría',
      senderId: menteeId,
    });
  }

  private mapToResponseDto(request: any): MentorshipRequestResponseDto {
    return {
      id: request.id,
      menteeId: request.menteeId,
      mentorId: request.mentorId,
      message: request.message,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      mentor: request.mentor,
      mentee: request.mentee,
      proposedSchedule: request.proposedSchedule,
    };
  }
}