import { NotificationResponseDto } from '../../domain/dto/notification/notification-response.dto.js';
import { NotificationBroadcasterRepository } from '../../domain/repositories/notification-broadcaster.repository.js';
import { SocketEvents } from '../websocket/events/socket-events.enum.js';
import { getIO, userRoom } from '../websocket/socket.server.js';

/**
 * Única implementación concreta de `NotificationBroadcasterRepository`.
 * Igual que con el correo (`NodemailerMailerRepository`), si el día de
 * mañana las notificaciones en tiempo real se mandan por otro medio (push
 * notifications, etc.), se cambia esta clase -- los use cases nunca se enteran.
 */
export class SocketNotificationBroadcasterRepository implements NotificationBroadcasterRepository {
  async broadcast(userId: string, notification: NotificationResponseDto): Promise<void> {
    getIO().to(userRoom(userId)).emit(SocketEvents.NOTIFICATION_NEW, notification);
  }
}
