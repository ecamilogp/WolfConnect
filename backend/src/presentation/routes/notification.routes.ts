import { Router } from 'express';

import { authenticate } from '../middlewares/authenticate.middleware.js';
import { NotificationController } from '../controllers/notification.controller.js';

const router = Router();

const notificationController = new NotificationController();

router.get('/', authenticate, notificationController.list);

router.patch('/read-all', authenticate, notificationController.markAllAsRead);

router.patch('/:notificationId/read', authenticate, notificationController.markAsRead);

export default router;
