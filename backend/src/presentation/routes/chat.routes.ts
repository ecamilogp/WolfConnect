import { Router } from 'express';

import { authenticate } from '../middlewares/authenticate.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { ChatController } from '../controllers/chat.controller.js';
import { createPrivateChatSchema } from '../validators/chat/create-private-chat.schema.js';
import { createGroupChatSchema } from '../validators/chat/create-group-chat.schema.js';
import { inviteUserToGroupSchema } from '../validators/chat/invite-user-to-group.schema.js';

const router = Router();

const chatController = new ChatController();

router.post(
  '/private',
  authenticate,
  validate(createPrivateChatSchema),
  chatController.createPrivateChat,
);

router.post(
  '/groups',
  authenticate,
  validate(createGroupChatSchema),
  chatController.createGroupChat,
);

router.post(
  '/groups/:chatId/invitations',
  authenticate,
  validate(inviteUserToGroupSchema),
  chatController.inviteUserToGroup,
);

export default router;
