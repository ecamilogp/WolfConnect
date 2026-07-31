import { NotificationResponseDto } from '../../../domain/dto/notification/notification-response.dto.js';
import { NotificationRepository } from '../../../domain/repositories/notification.repository.js';

export class ListNotificationsUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(userId: string): Promise<NotificationResponseDto[]> {
    return this.notificationRepository.findAllByUser(userId);
  }
}
