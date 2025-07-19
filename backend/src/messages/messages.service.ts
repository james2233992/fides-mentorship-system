import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesGateway } from './messages.gateway';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private messagesGateway: MessagesGateway,
  ) {}

  async create(createMessageDto: CreateMessageDto, senderId: string) {
    // Verify recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: createMessageDto.recipientId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    // Check if users have a mentorship relationship
    const hasRelationship = await this.checkMentorshipRelationship(senderId, createMessageDto.recipientId);
    
    if (!hasRelationship) {
      throw new ForbiddenException('You can only message users you have a mentorship relationship with');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        senderId,
        recipientId: createMessageDto.recipientId,
        content: createMessageDto.content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });

    // Send real-time notification
    this.messagesGateway.sendMessage(message);

    return message;
  }

  async getConversations(userId: string) {
    // Get all unique conversations for the user
    const conversations = await this.prisma.$queryRaw`
      SELECT DISTINCT
        CASE 
          WHEN m."senderId" = ${userId} THEN m."recipientId"
          ELSE m."senderId"
        END as "userId",
        MAX(m."createdAt") as "lastMessageAt",
        SUM(CASE WHEN m."recipientId" = ${userId} AND m."isRead" = false THEN 1 ELSE 0 END) as "unreadCount"
      FROM "messages" m
      WHERE (m."senderId" = ${userId} OR m."recipientId" = ${userId})
        AND m."deletedBySender" = false
        AND m."deletedByRecipient" = false
      GROUP BY "userId"
      ORDER BY "lastMessageAt" DESC
    `;

    // Get user details and last message for each conversation
    const conversationsWithDetails = await Promise.all(
      (conversations as any[]).map(async (conv) => {
        const user = await this.prisma.user.findUnique({
          where: { id: conv.userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicture: true,
            role: true,
          },
        });

        const lastMessage = await this.prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, recipientId: conv.userId },
              { senderId: conv.userId, recipientId: userId },
            ],
            deletedBySender: false,
            deletedByRecipient: false,
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        });

        return {
          user,
          lastMessage,
          unreadCount: Number(conv.unreadCount),
          lastMessageAt: conv.lastMessageAt,
        };
      })
    );

    return conversationsWithDetails.filter(conv => conv.user !== null);
  }

  async getMessages(userId: string, otherUserId: string, page: number = 1, limit: number = 50) {
    // Check if users have a mentorship relationship
    const hasRelationship = await this.checkMentorshipRelationship(userId, otherUserId);
    
    if (!hasRelationship) {
      throw new ForbiddenException('You can only view messages with users you have a mentorship relationship with');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, recipientId: otherUserId, deletedBySender: false },
            { senderId: otherUserId, recipientId: userId, deletedByRecipient: false },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
            },
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({
        where: {
          OR: [
            { senderId: userId, recipientId: otherUserId, deletedBySender: false },
            { senderId: otherUserId, recipientId: userId, deletedByRecipient: false },
          ],
        },
      }),
    ]);

    // Mark messages as read
    await this.prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        recipientId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return {
      data: messages.reverse(), // Reverse to show oldest first in conversation
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

  async markAsRead(messageIds: string[], userId: string) {
    const result = await this.prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        recipientId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return { count: result.count };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        recipientId: userId,
        isRead: false,
        deletedByRecipient: false,
      },
    });

    return { count };
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId && message.recipientId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    // Soft delete based on user role in the message
    if (message.senderId === userId) {
      await this.prisma.message.update({
        where: { id: messageId },
        data: { deletedBySender: true },
      });
    } else {
      await this.prisma.message.update({
        where: { id: messageId },
        data: { deletedByRecipient: true },
      });
    }

    return { success: true };
  }

  private async checkMentorshipRelationship(userId1: string, userId2: string): Promise<boolean> {
    // Check if users are admin
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: [userId1, userId2] },
      },
      select: {
        id: true,
        role: true,
      },
    });

    // Admins can message anyone
    if (users.some(u => u.role === 'ADMIN')) {
      return true;
    }

    // Check if they have any mentorship sessions together
    const sessions = await this.prisma.mentorshipSession.count({
      where: {
        OR: [
          { mentorId: userId1, menteeId: userId2 },
          { mentorId: userId2, menteeId: userId1 },
        ],
      },
    });

    return sessions > 0;
  }
}