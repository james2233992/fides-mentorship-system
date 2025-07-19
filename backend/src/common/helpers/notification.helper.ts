import { Injectable } from '@nestjs/common';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '@prisma/client';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationHelper {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Send notification for new mentorship request
   */
  async notifyMentorshipRequest(mentorId: string, menteeId: string, menteeName: string, requestId: string) {
    return this.createNotification({
      userId: mentorId,
      type: NotificationType.NEW_REQUEST,
      title: 'New Mentorship Request',
      message: `${menteeName} has sent you a mentorship request`,
      relatedId: requestId,
      metadata: { menteeId, requestId }
    });
  }

  /**
   * Send notification for accepted mentorship request
   */
  async notifyRequestAccepted(menteeId: string, mentorName: string, requestId: string) {
    return this.createNotification({
      userId: menteeId,
      type: NotificationType.REQUEST_ACCEPTED,
      title: 'Mentorship Request Accepted',
      message: `${mentorName} has accepted your mentorship request`,
      relatedId: requestId,
      metadata: { requestId }
    });
  }

  /**
   * Send notification for rejected mentorship request
   */
  async notifyRequestRejected(menteeId: string, mentorName: string, requestId: string) {
    return this.createNotification({
      userId: menteeId,
      type: NotificationType.REQUEST_REJECTED,
      title: 'Mentorship Request Declined',
      message: `${mentorName} has declined your mentorship request`,
      relatedId: requestId,
      metadata: { requestId }
    });
  }

  /**
   * Send notification for new scheduled session
   */
  async notifySessionScheduled(
    recipientId: string,
    sessionTitle: string,
    sessionId: string,
    scheduledAt: Date,
    otherPersonName: string
  ) {
    const formattedDate = scheduledAt.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return this.createNotification({
      userId: recipientId,
      type: NotificationType.SESSION_SCHEDULED,
      title: 'New Session Scheduled',
      message: `Session "${sessionTitle}" scheduled with ${otherPersonName} on ${formattedDate}`,
      relatedId: sessionId,
      metadata: { sessionId, scheduledAt: scheduledAt.toISOString() }
    });
  }

  /**
   * Send notification for cancelled session
   */
  async notifySessionCancelled(
    recipientId: string,
    sessionTitle: string,
    sessionId: string,
    cancelledBy: string,
    reason?: string
  ) {
    const message = reason 
      ? `Session "${sessionTitle}" has been cancelled by ${cancelledBy}. Reason: ${reason}`
      : `Session "${sessionTitle}" has been cancelled by ${cancelledBy}`;

    return this.createNotification({
      userId: recipientId,
      type: NotificationType.SESSION_CANCELLED,
      title: 'Session Cancelled',
      message,
      relatedId: sessionId,
      metadata: { sessionId, cancelledBy, reason }
    });
  }

  /**
   * Send reminder notification for upcoming session
   */
  async notifySessionReminder(
    recipientId: string,
    sessionTitle: string,
    sessionId: string,
    scheduledAt: Date,
    minutesUntilSession: number
  ) {
    const timeString = minutesUntilSession < 60 
      ? `${minutesUntilSession} minutes`
      : `${Math.floor(minutesUntilSession / 60)} hours`;

    return this.createNotification({
      userId: recipientId,
      type: NotificationType.SESSION_REMINDER,
      title: 'Session Reminder',
      message: `Your session "${sessionTitle}" starts in ${timeString}`,
      relatedId: sessionId,
      metadata: { 
        sessionId, 
        scheduledAt: scheduledAt.toISOString(),
        minutesUntilSession 
      }
    });
  }

  /**
   * Send notification for completed session (feedback request)
   */
  async notifySessionCompleted(
    recipientId: string,
    sessionTitle: string,
    sessionId: string,
    otherPersonName: string
  ) {
    return this.createNotification({
      userId: recipientId,
      type: NotificationType.SESSION_COMPLETED,
      title: 'Session Completed',
      message: `Your session "${sessionTitle}" with ${otherPersonName} has been completed. Please provide feedback.`,
      relatedId: sessionId,
      metadata: { sessionId }
    });
  }

  /**
   * Send notification for new message
   */
  async notifyNewMessage(
    recipientId: string,
    senderName: string,
    messagePreview: string,
    conversationId: string
  ) {
    const truncatedMessage = messagePreview.length > 100 
      ? messagePreview.substring(0, 97) + '...'
      : messagePreview;

    return this.createNotification({
      userId: recipientId,
      type: NotificationType.NEW_MESSAGE,
      title: `New message from ${senderName}`,
      message: truncatedMessage,
      relatedId: conversationId,
      metadata: { conversationId }
    });
  }

  /**
   * Send notification for new feedback received
   */
  async notifyFeedbackReceived(
    recipientId: string,
    sessionTitle: string,
    feedbackId: string,
    rating: number
  ) {
    const ratingStars = '⭐'.repeat(rating);
    
    return this.createNotification({
      userId: recipientId,
      type: NotificationType.FEEDBACK_RECEIVED,
      title: 'New Feedback Received',
      message: `You received ${ratingStars} feedback for session "${sessionTitle}"`,
      relatedId: feedbackId,
      metadata: { feedbackId, rating }
    });
  }

  /**
   * Send notification for goal deadline approaching
   */
  async notifyGoalDeadline(
    userId: string,
    goalTitle: string,
    goalId: string,
    daysUntilDeadline: number
  ) {
    const urgency = daysUntilDeadline <= 1 ? 'tomorrow' : `in ${daysUntilDeadline} days`;
    
    return this.createNotification({
      userId,
      type: NotificationType.GOAL_DEADLINE,
      title: 'Goal Deadline Approaching',
      message: `Your goal "${goalTitle}" is due ${urgency}`,
      relatedId: goalId,
      metadata: { goalId, daysUntilDeadline }
    });
  }

  /**
   * Core method to create notification with error handling
   */
  private async createNotification(data: NotificationData) {
    try {
      return await this.notificationsService.create(data);
    } catch (error) {
      console.error('Failed to create notification:', error);
      // Don't throw error to prevent notification failures from breaking main flow
      return null;
    }
  }

  /**
   * Batch create notifications for multiple users
   */
  async createBatchNotifications(
    userIds: string[],
    notificationData: Omit<NotificationData, 'userId'>
  ) {
    const promises = userIds.map(userId =>
      this.createNotification({ ...notificationData, userId })
    );
    
    return Promise.allSettled(promises);
  }
}