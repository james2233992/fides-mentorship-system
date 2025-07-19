import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(createFeedbackDto: CreateFeedbackDto, userId: string) {
    // Check if session exists and user is participant
    const session = await this.prisma.mentorshipSession.findUnique({
      where: { id: createFeedbackDto.sessionId },
      include: {
        mentor: true,
        mentee: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if user is participant
    const isMentor = session.mentorId === userId;
    const isMentee = session.menteeId === userId;

    if (!isMentor && !isMentee) {
      throw new ForbiddenException('You are not a participant in this session');
    }

    // Check if session is completed
    if (session.status !== 'COMPLETED') {
      throw new BadRequestException('Session must be completed before providing feedback');
    }

    // Check if feedback already exists
    const existingFeedback = await this.prisma.sessionFeedback.findUnique({
      where: { sessionId: createFeedbackDto.sessionId },
    });

    if (existingFeedback) {
      // Update existing feedback
      return this.prisma.sessionFeedback.update({
        where: { sessionId: createFeedbackDto.sessionId },
        data: {
          rating: isMentee ? createFeedbackDto.rating : existingFeedback.rating,
          feedback: isMentee ? createFeedbackDto.feedback : existingFeedback.feedback,
          mentorNotes: isMentor ? createFeedbackDto.mentorNotes : existingFeedback.mentorNotes,
        },
      });
    }

    // Create new feedback
    return this.prisma.sessionFeedback.create({
      data: {
        sessionId: createFeedbackDto.sessionId,
        rating: isMentee ? (createFeedbackDto.rating || 0) : 0,
        feedback: isMentee ? createFeedbackDto.feedback : null,
        mentorNotes: isMentor ? createFeedbackDto.mentorNotes : null,
      },
    });
  }

  async findAll(userId: string, role: string) {
    const whereClause = role === 'ADMIN' 
      ? {} 
      : {
          session: {
            OR: [
              { mentorId: userId },
              { menteeId: userId },
            ],
          },
        };

    return this.prisma.sessionFeedback.findMany({
      where: whereClause,
      include: {
        session: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySession(sessionId: string, userId: string) {
    const session = await this.prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if user is participant or admin
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (
      user?.role !== 'ADMIN' &&
      session.mentorId !== userId &&
      session.menteeId !== userId
    ) {
      throw new ForbiddenException('You are not authorized to view this feedback');
    }

    const feedback = await this.prisma.sessionFeedback.findUnique({
      where: { sessionId },
      include: {
        session: {
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
        },
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found for this session');
    }

    // Hide mentor notes from mentees
    if (session.menteeId === userId && feedback.mentorNotes) {
      feedback.mentorNotes = null;
    }

    return feedback;
  }

  async getSessionsAwaitingFeedback(userId: string) {
    // Get user to determine role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get completed sessions where the user is a participant
    const sessions = await this.prisma.mentorshipSession.findMany({
      where: {
        OR: [
          { mentorId: userId },
          { menteeId: userId },
        ],
        status: 'COMPLETED',
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
        feedback: true,
      },
      orderBy: { completedAt: 'desc' },
    });

    // Filter sessions based on what feedback is missing
    return sessions.filter(session => {
      if (!session.feedback) {
        // No feedback at all - both mentor and mentee can provide feedback
        return true;
      }

      // For mentees: check if they haven't provided rating yet
      if (session.menteeId === userId && (!session.feedback.rating || session.feedback.rating === 0)) {
        return true;
      }

      // For mentors: check if they haven't provided notes yet
      if (session.mentorId === userId && !session.feedback.mentorNotes) {
        return true;
      }

      return false;
    }).map(session => {
      // Remove feedback from response
      const { feedback, ...sessionWithoutFeedback } = session;
      return sessionWithoutFeedback;
    });
  }

  async getMentorStats(mentorId: string) {
    const feedbacks = await this.prisma.sessionFeedback.findMany({
      where: {
        session: {
          mentorId,
        },
        rating: {
          gt: 0,
        },
      },
    });

    if (feedbacks.length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0,
        },
      };
    }

    const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
    const averageRating = totalRating / feedbacks.length;

    const ratingDistribution = feedbacks.reduce((dist, fb) => {
      dist[fb.rating] = (dist[fb.rating] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: feedbacks.length,
      ratingDistribution: {
        1: ratingDistribution[1] || 0,
        2: ratingDistribution[2] || 0,
        3: ratingDistribution[3] || 0,
        4: ratingDistribution[4] || 0,
        5: ratingDistribution[5] || 0,
      },
    };
  }

  async update(id: string, updateFeedbackDto: UpdateFeedbackDto, userId: string) {
    const feedback = await this.prisma.sessionFeedback.findUnique({
      where: { id },
      include: {
        session: true,
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // Check if user is participant
    const isMentor = feedback.session.mentorId === userId;
    const isMentee = feedback.session.menteeId === userId;

    if (!isMentor && !isMentee) {
      throw new ForbiddenException('You are not authorized to update this feedback');
    }

    // Mentees can only update rating and feedback
    // Mentors can only update mentorNotes
    const updateData: any = {};

    if (isMentee) {
      if (updateFeedbackDto.rating !== undefined) {
        updateData.rating = updateFeedbackDto.rating;
      }
      if (updateFeedbackDto.feedback !== undefined) {
        updateData.feedback = updateFeedbackDto.feedback;
      }
    }

    if (isMentor && updateFeedbackDto.mentorNotes !== undefined) {
      updateData.mentorNotes = updateFeedbackDto.mentorNotes;
    }

    return this.prisma.sessionFeedback.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string) {
    const feedback = await this.prisma.sessionFeedback.findUnique({
      where: { id },
      include: {
        session: true,
      },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    // Only admin can delete feedback
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can delete feedback');
    }

    return this.prisma.sessionFeedback.delete({
      where: { id },
    });
  }
}