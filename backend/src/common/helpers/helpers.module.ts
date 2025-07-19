import { Module } from '@nestjs/common';
import { NotificationHelper } from './notification.helper';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [NotificationHelper],
  exports: [NotificationHelper],
})
export class HelpersModule {}