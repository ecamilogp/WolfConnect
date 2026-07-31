import { CreateNotificationDto } from '../../../domain/dto/notification/create-notification.dto.js';
import { NotificationResponseDto } from '../../../domain/dto/notification/notification-response.dto.js';
import { NotificationBroadcasterRepository } from '../../../domain/repositories/notification-broadcaster.repository.js';
import { NotificationRepository } from '../../../domain/repositories/notification.repository.js';

/**
 * Pieza reutilizable: persiste la notificación y la emite en tiempo real.
 * Cualquier otra use case que necesite notificar a alguien (invitación a
 * grupo, invitación aceptada/rechazada, nuevo miembro, etc.) recibe esta
 * clase por constructor y la llama -- así el requisito "guardar + emitir"
 * se cumple una sola vez, no se repite en cada flujo.
 */
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
