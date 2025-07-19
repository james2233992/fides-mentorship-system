import { Module } from '@nestjs/common';
import { MentorshipRequestsController } from './mentorship-requests.controller';
import { MentorshipRequestsService } from './mentorship-requests.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
  imports: [PrismaModule, NotificationsModule, SessionsModule],
  controllers: [MentorshipRequestsController],
  providers: [MentorshipRequestsService],
  exports: [MentorshipRequestsService],
})
export class MentorshipRequestsModule {}