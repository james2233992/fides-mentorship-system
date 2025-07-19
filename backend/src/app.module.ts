import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { WebSocketsModule } from './websockets/websockets.module';
import { QueuesModule } from './queues/queues.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SessionsModule } from './sessions/sessions.module';
import { MentorshipRequestsModule } from './mentorship-requests/mentorship-requests.module';
import { AvailabilityModule } from './availability/availability.module';
import { FeedbackModule } from './feedback/feedback.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MessagesModule } from './messages/messages.module';
import { ResourcesModule } from './resources/resources.module';
import { GoalsModule } from './goals/goals.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configuration,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time to live in milliseconds (60 seconds)
      limit: 10, // Number of requests per TTL
    }]),
    PrismaModule,
    CacheModule,
    WebSocketsModule,
    QueuesModule,
    UsersModule,
    AuthModule,
    SchedulingModule,
    NotificationsModule,
    SessionsModule,
    MentorshipRequestsModule,
    AvailabilityModule,
    FeedbackModule,
    AnalyticsModule,
    MessagesModule,
    ResourcesModule,
    GoalsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
