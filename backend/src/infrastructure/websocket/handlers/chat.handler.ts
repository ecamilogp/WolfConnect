import { Server } from 'socket.io';

import { SendMessageUseCase } from '../../../application/use-cases/message/send-message.use-case.js';
import { EditMessageUseCase } from '../../../application/use-cases/message/edit-message.use-case.js';
import { DeleteMessageUseCase } from '../../../application/use-cases/message/delete-message.use-case.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';
import { PrismaChatRepository } from '../../repositories/prisma-chat.repository.js';
import { PrismaMessageRepository } from '../../repositories/prisma-message.repository.js';
import { SocketEvents } from '../events/socket-events.enum.js';
import { AuthenticatedSocket } from '../types/authenticated-socket.type.js';
import {
  ChatJoinPayload,
  ChatLeavePayload,
  MessageDeletedPayload,
  MessageDeletePayload,
  MessageEditPayload,
  MessageSendPayload,
} from '../types/socket-payloads.type.js';
import { emitSocketError } from '../utils/emit-error.util.js';

const chatRepository = new PrismaChatRepository();
const messageRepository = new PrismaMessageRepository();

const sendMessageUseCase = new SendMessageUseCase(chatRepository, messageRepository);
const editMessageUseCase = new EditMessageUseCase(messageRepository);
const deleteMessageUseCase = new DeleteMessageUseCase(messageRepository);

export function chatRoom(chatId: string): string {
  return `chat:${chatId}`;
}

export function registerChatHandlers(io: Server, socket: AuthenticatedSocket): void {
  const userId = socket.data.user.id;

  socket.on(SocketEvents.CHAT_JOIN, async ({ chatId }: ChatJoinPayload) => {
    try {
      const participant = await chatRepository.findParticipantByUser(chatId, userId);

      if (!participant) {
        throw new ForbiddenError('You are not a participant of this chat.');
      }

      await socket.join(chatRoom(chatId));

      socket.emit(SocketEvents.CHAT_JOINED, { chatId });
    } catch (error) {
      emitSocketError(socket, error);
    }
  });

  socket.on(SocketEvents.CHAT_LEAVE, async ({ chatId }: ChatLeavePayload) => {
    await socket.leave(chatRoom(chatId));

    socket.emit(SocketEvents.CHAT_LEFT, { chatId });
  });

  socket.on(SocketEvents.MESSAGE_SEND, async ({ chatId, content, replyToMessageId }: MessageSendPayload) => {
    try {
      const message = await sendMessageUseCase.execute({
        chatId,
        senderId: userId,
        content,
        replyToMessageId,
      });

      io.to(chatRoom(chatId)).emit(SocketEvents.MESSAGE_NEW, message);
    } catch (error) {
      emitSocketError(socket, error);
    }
  });

  socket.on(SocketEvents.MESSAGE_EDIT, async ({ messageId, content }: MessageEditPayload) => {
    try {
      const message = await editMessageUseCase.execute({ messageId, userId, content });

      io.to(chatRoom(message.chatId)).emit(SocketEvents.MESSAGE_EDITED, message);
    } catch (error) {
      emitSocketError(socket, error);
    }
  });

  socket.on(SocketEvents.MESSAGE_DELETE, async ({ messageId }: MessageDeletePayload) => {
    try {
      const existing = await messageRepository.findById(messageId);

      if (!existing) {
        throw new NotFoundError('Message not found.');
      }

      await deleteMessageUseCase.execute({ messageId, userId });

      const payload: MessageDeletedPayload = { messageId, chatId: existing.chatId };

      io.to(chatRoom(existing.chatId)).emit(SocketEvents.MESSAGE_DELETED, payload);
    } catch (error) {
      emitSocketError(socket, error);
    }
  });
}
