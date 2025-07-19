import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
}

@Injectable()
export class NotificationQueue {
  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async addNotification(data: NotificationJobData) {
    return this.addNotificationJob(data);
  }

  async addNotificationJob(data: NotificationJobData) {
    return await this.notificationQueue.add('send-notification', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async addBulkNotificationJob(notifications: NotificationJobData[]) {
    const jobs = notifications.map((data) => ({
      name: 'send-notification',
      data,
      opts: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }));

    return await this.notificationQueue.addBulk(jobs);
  }

  async scheduleNotification(data: NotificationJobData, delay: number) {
    return await this.notificationQueue.add('send-notification', data, {
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}