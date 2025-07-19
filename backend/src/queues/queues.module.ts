import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationQueue } from './notification.queue';
import { NotificationProcessor } from './notification.processor';
import { SchedulingQueue } from './scheduling.queue';
import { SchedulingProcessor } from './scheduling.processor';
import { ReminderProcessor } from './reminder.processor';
import { EmailService } from '../notifications/services/email.service';
import { SmsService } from '../notifications/services/sms.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WebSocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('bull.redis.host'),
          port: configService.get('bull.redis.port'),
          password: configService.get('bull.redis.password'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
    BullModule.registerQueue({
      name: 'scheduling',
    }),
    PrismaModule,
    forwardRef(() => WebSocketsModule),
  ],
  providers: [
    NotificationQueue,
    NotificationProcessor,
    SchedulingQueue,
    SchedulingProcessor,
    ReminderProcessor,
    EmailService,
    SmsService,
  ],
  exports: [NotificationQueue, SchedulingQueue],
})
export class QueuesModule {}