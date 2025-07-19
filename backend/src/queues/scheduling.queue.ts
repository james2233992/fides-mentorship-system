import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface SchedulingJobData {
  sessionId: string;
  type: 'reminder' | 'check-availability' | 'session-start';
  scheduledFor: Date;
  metadata?: any;
}

@Injectable()
export class SchedulingQueue {
  constructor(
    @InjectQueue('scheduling') private schedulingQueue: Queue,
  ) {}

  async addSchedulingJob(data: SchedulingJobData) {
    const delay = new Date(data.scheduledFor).getTime() - Date.now();
    
    return await this.schedulingQueue.add('process-schedule', data, {
      delay: delay > 0 ? delay : 0,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  }

  async addRecurringJob(name: string, data: any, pattern: string) {
    return await this.schedulingQueue.add(name, data, {
      repeat: {
        pattern, // Cron pattern
      },
    });
  }

  async removeRecurringJob(name: string, pattern: string) {
    return await this.schedulingQueue.removeRepeatable(name, {
      pattern,
    });
  }
}