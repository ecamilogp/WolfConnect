import { CreateNotificationDto } from '../dto/notification/create-notification.dto.js';
import { NotificationResponseDto } from '../dto/notification/notification-response.dto.js';

export interface NotificationRepository {
  create(data: CreateNotificationDto): Promise<NotificationResponseDto>;

  findAllByUser(userId: string): Promise<NotificationResponseDto[]>;

  findById(id: string): Promise<NotificationResponseDto | null>;

  markAsRead(id: string): Promise<void>;

  markAllAsRead(userId: string): Promise<void>;
}
