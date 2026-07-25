import { Router } from 'express';

import { authenticate } from '../middlewares/authenticate.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { ChatController } from '../controllers/chat.controller.js';
import { createPrivateChatSchema } from '../validators/chat/create-private-chat.schema.js';

const router = Router();

const chatController = new ChatController();

router.post(
  '/private',
  authenticate,
  validate(createPrivateChatSchema),
  chatController.createPrivateChat,
);

export default router;
