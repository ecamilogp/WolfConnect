import { Prisma } from '@prisma/client';

import { CreateNotificationDto } from '../../domain/dto/notification/create-notification.dto.js';
import { NotificationResponseDto } from '../../domain/dto/notification/notification-response.dto.js';
import { Notification } from '../../domain/entities/notification.entity.js';
import { NotificationRepository } from '../../domain/repositories/notification.repository.js';
import { prisma } from '../database/prisma.service.js';

export class PrismaNotificationRepository implements NotificationRepository {
  async create(data: CreateNotificationDto): Promise<NotificationResponseDto> {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: (data.data ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      isRead: notification.isRead,
      data: notification.data as Record<string, unknown> | null,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  async findAllByUser(userId: string): Promise<NotificationResponseDto[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications.map((notification) => ({
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      isRead: notification.isRead,
      data: notification.data as Record<string, unknown> | null,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    }));
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = await prisma.notification.findUnique({
      where: {
        id,
      },
    });

    if (!notification) {
      return null;
    }

    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      isRead: notification.isRead,
      data: notification.data as Record<string, unknown> | null,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  async markAsRead(id: string): Promise<void> {
    await prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
