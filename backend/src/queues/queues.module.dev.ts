import { Module, forwardRef } from '@nestjs/common';
import { MockNotificationQueue } from './mock-notification.queue';
import { EmailService } from '../notifications/services/email.service';
import { SmsService } from '../notifications/services/sms.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WebSocketsModule } from '../websockets/websockets.module';

// Mock SchedulingQueue for development
@Module({})
class MockSchedulingQueue {}

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => WebSocketsModule),
  ],
  providers: [
    {
      provide: 'NotificationQueue',
      useClass: MockNotificationQueue,
    },
    {
      provide: 'SchedulingQueue',
      useClass: MockSchedulingQueue,
    },
    EmailService,
    SmsService,
  ],
  exports: ['NotificationQueue', 'SchedulingQueue'],
})
export class QueuesModuleDev {}