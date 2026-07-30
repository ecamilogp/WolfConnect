import { NotificationRepository } from '../../../domain/repositories/notification.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class MarkNotificationAsReadUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundError('Notification not found.');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenError('You can only mark your own notifications as read.');
    }

    await this.notificationRepository.markAsRead(notificationId);
  }
}
