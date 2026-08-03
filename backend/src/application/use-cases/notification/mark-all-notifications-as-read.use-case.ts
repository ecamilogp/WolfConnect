import { NotificationRepository } from '../../../domain/repositories/notification.repository.js';

export class MarkAllNotificationsAsReadUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }
}
