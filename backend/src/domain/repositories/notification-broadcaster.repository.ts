import { NotificationResponseDto } from '../dto/notification/notification-response.dto.js';

export interface NotificationBroadcasterRepository {
  broadcast(userId: string, notification: NotificationResponseDto): Promise<void>;
}
