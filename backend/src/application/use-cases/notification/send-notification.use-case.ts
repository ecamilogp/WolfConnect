import { CreateNotificationDto } from '../../../domain/dto/notification/create-notification.dto.js';
import { NotificationResponseDto } from '../../../domain/dto/notification/notification-response.dto.js';
import { NotificationBroadcasterRepository } from '../../../domain/repositories/notification-broadcaster.repository.js';
import { NotificationRepository } from '../../../domain/repositories/notification.repository.js';

export class SendNotificationUseCase {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationBroadcaster: NotificationBroadcasterRepository,
  ) {}

  async execute(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.create(dto);

    await this.notificationBroadcaster.broadcast(notification.userId, notification);

    return notification;
  }
}
