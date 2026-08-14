import { SendNotificationUseCase } from '../../src/application/use-cases/notification/send-notification.use-case.js';
import { CreateNotificationDto } from '../../src/domain/dto/notification/create-notification.dto.js';
import { NotificationResponseDto } from '../../src/domain/dto/notification/notification-response.dto.js';
import { NotificationRepository } from '../../src/domain/repositories/notification.repository.js';
import { NotificationBroadcasterRepository } from '../../src/domain/repositories/notification-broadcaster.repository.js';

class FakeNotificationRepository implements NotificationRepository {
  readonly created: CreateNotificationDto[] = [];

  async create(data: CreateNotificationDto): Promise<NotificationResponseDto> {
    this.created.push(data);

    return {
      id: `notification-${this.created.length}`,
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body,
      isRead: false,
      data: data.data ?? null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    };
  }

  async findAllByUser(): Promise<NotificationResponseDto[]> {
    throw new Error('findAllByUser is not implemented in this fake.');
  }

  async findById(): Promise<NotificationResponseDto | null> {
    throw new Error('findById is not implemented in this fake.');
  }

  async markAsRead(): Promise<void> {
    throw new Error('markAsRead is not implemented in this fake.');
  }

  async markAllAsRead(): Promise<void> {
    throw new Error('markAllAsRead is not implemented in this fake.');
  }
}

class FakeNotificationBroadcasterRepository implements NotificationBroadcasterRepository {
  readonly broadcasts: Array<{ userId: string; notification: NotificationResponseDto }> = [];

  async broadcast(userId: string, notification: NotificationResponseDto): Promise<void> {
    this.broadcasts.push({ userId, notification });
  }
}

/**
 * Builds a real `SendNotificationUseCase` wired to in-memory fakes, so the
 * group use cases that depend on it exercise their real notification-sending
 * logic without touching a database or a socket server. `sentNotifications`
 * exposes what was actually sent for assertions.
 */
export function createFakeSendNotificationUseCase(): {
  sendNotificationUseCase: SendNotificationUseCase;
  sentNotifications: CreateNotificationDto[];
} {
  const notificationRepository = new FakeNotificationRepository();
  const notificationBroadcaster = new FakeNotificationBroadcasterRepository();

  return {
    sendNotificationUseCase: new SendNotificationUseCase(notificationRepository, notificationBroadcaster),
    sentNotifications: notificationRepository.created,
  };
}
