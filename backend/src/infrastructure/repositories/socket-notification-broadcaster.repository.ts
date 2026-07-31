import { NotificationResponseDto } from '../../domain/dto/notification/notification-response.dto.js';
import { NotificationBroadcasterRepository } from '../../domain/repositories/notification-broadcaster.repository.js';
import { SocketEvents } from '../websocket/events/socket-events.enum.js';
import { getIO, userRoom } from '../websocket/socket.server.js';

export class SocketNotificationBroadcasterRepository implements NotificationBroadcasterRepository {
  async broadcast(userId: string, notification: NotificationResponseDto): Promise<void> {
    getIO().to(userRoom(userId)).emit(SocketEvents.NOTIFICATION_NEW, notification);
  }
}
