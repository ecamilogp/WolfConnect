import { NextFunction, Request, Response } from 'express';

import { ListNotificationsUseCase } from '../../application/use-cases/notification/list-notifications.use-case.js';
import { MarkAllNotificationsAsReadUseCase } from '../../application/use-cases/notification/mark-all-notifications-as-read.use-case.js';
import { MarkNotificationAsReadUseCase } from '../../application/use-cases/notification/mark-notification-as-read.use-case.js';
import { PrismaNotificationRepository } from '../../infrastructure/repositories/prisma-notification.repository.js';

export class NotificationController {
  private readonly notificationRepository = new PrismaNotificationRepository();

  private readonly listNotificationsUseCase = new ListNotificationsUseCase(
    this.notificationRepository,
  );

  private readonly markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(
    this.notificationRepository,
  );

  private readonly markAllNotificationsAsReadUseCase = new MarkAllNotificationsAsReadUseCase(
    this.notificationRepository,
  );

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notifications = await this.listNotificationsUseCase.execute(req.user.id);

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.markNotificationAsReadUseCase.execute(
        String(req.params.notificationId),
        req.user.id,
      );

      res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
      });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.markAllNotificationsAsReadUseCase.execute(req.user.id);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
      });
    } catch (error) {
      next(error);
    }
  };
}
