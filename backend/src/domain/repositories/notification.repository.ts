import { Notification } from '../entities/notification.entity.js';
import { CreateNotificationDto } from '../dto/notification/create-notification.dto.js';
import { NotificationResponseDto } from '../dto/notification/notification-response.dto.js';

export interface NotificationRepository {
  create(data: CreateNotificationDto): Promise<NotificationResponseDto>;

  findAllByUser(userId: string): Promise<NotificationResponseDto[]>;

  findById(id: string): Promise<Notification | null>;

  markAsRead(id: string): Promise<void>;

  markAllAsRead(userId: string): Promise<void>;
}
