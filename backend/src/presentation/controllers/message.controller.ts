import { NextFunction, Request, Response } from 'express';

import { PrismaAttachmentRepository } from '../../infrastructure/repositories/prisma-attachment.repository.js';
import { PrismaChatRepository } from '../../infrastructure/repositories/prisma-chat.repository.js';
import { PrismaMessageRepository } from '../../infrastructure/repositories/prisma-message.repository.js';
import { SendMessageUseCase } from '../../application/use-cases/message/send-message.use-case.js';
import { SendMessageWithAttachmentUseCase } from '../../application/use-cases/message/send-message-with-attachment.use-case.js';
import { GetMessagesUseCase } from '../../application/use-cases/message/get-messages.use-case.js';
import { EditMessageUseCase } from '../../application/use-cases/message/edit-message.use-case.js';
import { DeleteMessageUseCase } from '../../application/use-cases/message/delete-message.use-case.js';
import { MarkMessagesAsReadUseCase } from '../../application/use-cases/message/mark-messages-as-read.use-case.js';
import { SocketEvents } from '../../infrastructure/websocket/events/socket-events.enum.js';
import { chatRoom } from '../../infrastructure/websocket/handlers/chat.handler.js';
import { getIO } from '../../infrastructure/websocket/socket.server.js';
import { MessageReadUpdatedPayload } from '../../infrastructure/websocket/types/socket-payloads.type.js';
import { BadRequestError } from '../../shared/errors/bad-request-error.js';

export class MessageController {
  private readonly chatRepository = new PrismaChatRepository();

  private readonly messageRepository = new PrismaMessageRepository();

  private readonly attachmentRepository = new PrismaAttachmentRepository();

  private readonly sendMessageUseCase = new SendMessageUseCase(
    this.chatRepository,
    this.messageRepository,
  );

  private readonly sendMessageWithAttachmentUseCase = new SendMessageWithAttachmentUseCase(
    this.chatRepository,
    this.messageRepository,
    this.attachmentRepository,
  );

  private readonly getMessagesUseCase = new GetMessagesUseCase(
    this.chatRepository,
    this.messageRepository,
  );

  private readonly editMessageUseCase = new EditMessageUseCase(this.messageRepository);

  private readonly deleteMessageUseCase = new DeleteMessageUseCase(this.messageRepository);

  private readonly markMessagesAsReadUseCase = new MarkMessagesAsReadUseCase(
    this.chatRepository,
    this.messageRepository,
  );

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const message = await this.sendMessageUseCase.execute({
        chatId: String(req.params.chatId),
        senderId: req.user.id,
        content: req.body.content,
        replyToMessageId: req.body.replyToMessageId,
      });

      res.status(201).json({
        success: true,
        message: 'Message sent successfully.',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  sendMessageWithAttachment = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestError('A file is required.');
      }

      const chatId = String(req.params.chatId);
      const rawContent = typeof req.body.content === 'string' ? req.body.content.trim() : '';

      const message = await this.sendMessageWithAttachmentUseCase.execute({
        chatId,
        senderId: req.user.id,
        content: rawContent.length > 0 ? rawContent : null,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      });

      try {
        getIO().to(chatRoom(chatId)).emit(SocketEvents.MESSAGE_NEW, message);
      } catch (socketError) {
        console.error('[message:attachment:socket-emit-failed]', socketError);
      }

      res.status(201).json({
        success: true,
        message: 'Message sent successfully.',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const messages = await this.getMessagesUseCase.execute(
        String(req.params.chatId),
        req.user.id,
      );

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  };

  editMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const message = await this.editMessageUseCase.execute({
        messageId: String(req.params.messageId),
        userId: req.user.id,
        content: req.body.content,
      });

      res.status(200).json({
        success: true,
        message: 'Message updated successfully.',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteMessageUseCase.execute({
        messageId: String(req.params.messageId),
        userId: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Message deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  markMessagesAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chatId = String(req.params.chatId);

      const fullyReadMessageIds = await this.markMessagesAsReadUseCase.execute({
        chatId,
        userId: req.user.id,
      });

      if (fullyReadMessageIds.length > 0) {
        const payload: MessageReadUpdatedPayload = {
          chatId,
          messageIds: fullyReadMessageIds,
        };

        try {
          getIO().to(chatRoom(chatId)).emit(SocketEvents.MESSAGE_READ_UPDATED, payload);
        } catch (socketError) {
          console.error('Failed to emit message:read:updated event', socketError);
        }
      }

      res.status(200).json({
        success: true,
        message: 'Messages marked as read.',
      });
    } catch (error) {
      next(error);
    }
  };
}
