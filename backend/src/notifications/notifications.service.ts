import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const notifications = await this.prisma.userNotification.findMany({
      where: { userId },
      include: {
        notification: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            session: {
              select: {
                id: true,
                title: true,
                scheduledAt: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications.map((un) => ({
      ...un.notification,
      userNotificationId: un.id,
      notificationId: un.notification.id,
      isRead: un.isRead,
      readAt: un.readAt,
      userNotificationCreatedAt: un.createdAt,
    }));
  }

  async findUnread(userId: string) {
    const count = await this.prisma.userNotification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { count };
  }

  async markAsRead(userId: string, notificationId: string) {
    const userNotification = await this.prisma.userNotification.findFirst({
      where: {
        userId,
        notificationId,
      },
    });

    if (!userNotification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.userNotification.update({
      where: {
        id: userNotification.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.userNotification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async create(data: {
    type: NotificationType;
    title: string;
    message: string;
    userId: string;
    senderId?: string;
    sessionId?: string;
    metadata?: any;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        senderId: data.senderId,
        sessionId: data.sessionId,
        metadata: data.metadata,
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

  async createBulk(data: {
    type: NotificationType;
    title: string;
    message: string;
    userIds: string[];
    senderId?: string;
    sessionId?: string;
    metadata?: any;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        senderId: data.senderId,
        sessionId: data.sessionId,
        metadata: data.metadata,
      },
    });

    await this.prisma.userNotification.createMany({
      data: data.userIds.map((userId) => ({
        userId,
        notificationId: notification.id,
      })),
    });

    return notification;
  }

  async delete(userId: string, notificationId: string) {
    const userNotification = await this.prisma.userNotification.findFirst({
      where: {
        userId,
        notificationId,
      },
    });

    if (!userNotification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.userNotification.delete({
      where: {
        id: userNotification.id,
      },
    });
  }
}