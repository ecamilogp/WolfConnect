import { Router } from 'express';

import { authenticate } from '../middlewares/authenticate.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { ChatController } from '../controllers/chat.controller.js';
import { MessageController } from '../controllers/message.controller.js';
import { AttachmentController } from '../controllers/attachment.controller.js';
import { MessageReactionController } from '../controllers/message-reaction.controller.js';
import { uploadSingleAttachment } from '../middlewares/upload.middleware.js';
import { createPrivateChatSchema } from '../validators/chat/create-private-chat.schema.js';
import { createGroupChatSchema } from '../validators/chat/create-group-chat.schema.js';
import { inviteUserToGroupSchema } from '../validators/chat/invite-user-to-group.schema.js';
import { sendMessageSchema } from '../validators/message/send-message.schema.js';
import { editMessageSchema } from '../validators/message/edit-message.schema.js';
import { setMessageReactionSchema } from '../validators/message/set-message-reaction.schema.js';
import { updateGroupSchema } from '../validators/chat/update-group.schema.js';

const router = Router();

const chatController = new ChatController();
const messageController = new MessageController();
const attachmentController = new AttachmentController();
const messageReactionController = new MessageReactionController();

router.get('/', authenticate, chatController.getChats);

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

router.patch(
  '/groups/invitations/:invitationId/accept',
  authenticate,
  chatController.acceptGroupInvitation,
);

router.patch(
  '/groups/invitations/:invitationId/reject',
  authenticate,
  chatController.rejectGroupInvitation,
);

router.get('/groups/invitations', authenticate, chatController.getPendingInvitations);

router.get('/groups/:chatId', authenticate, chatController.getGroupDetail);

router.patch('/groups/:chatId/leave', authenticate, chatController.leaveGroup);

router.delete('/groups/:chatId', authenticate, chatController.deleteGroup);

router.patch(
  '/groups/:chatId',
  authenticate,
  validate(updateGroupSchema),
  chatController.updateGroup,
);

router.patch(
  '/groups/:chatId/participants/:userId/promote',
  authenticate,
  chatController.promoteToAdmin,
);

router.patch(
  '/groups/:chatId/participants/:userId/demote',
  authenticate,
  chatController.demoteAdmin,
);

router.delete(
  '/groups/:chatId/participants/:userId',
  authenticate,
  chatController.removeParticipant,
);

router.patch(
  '/groups/:chatId/owner/:userId',
  authenticate,
  chatController.transferOwnership,
);

router.post(
  '/:chatId/messages',
  authenticate,
  validate(sendMessageSchema),
  messageController.sendMessage,
);

router.get('/:chatId/messages', authenticate, messageController.getMessages);

router.patch(
  '/messages/:messageId',
  authenticate,
  validate(editMessageSchema),
  messageController.editMessage,
);

router.delete('/messages/:messageId', authenticate, messageController.deleteMessage);

router.post(
  '/messages/:messageId/attachments',
  authenticate,
  uploadSingleAttachment,
  attachmentController.uploadAttachment,
);

router.patch('/:chatId/read', authenticate, messageController.markMessagesAsRead);

router.put(
  '/messages/:messageId/reactions',
  authenticate,
  validate(setMessageReactionSchema),
  messageReactionController.setReaction,
);

router.delete(
  '/messages/:messageId/reactions',
  authenticate,
  messageReactionController.removeReaction,
);

export default router;
