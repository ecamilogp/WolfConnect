import { NextFunction, Request, Response } from 'express';

import { PrismaChatRepository } from '../../infrastructure/repositories/prisma-chat.repository.js';
import { PrismaMessageRepository } from '../../infrastructure/repositories/prisma-message.repository.js';
import { SendMessageUseCase } from '../../application/use-cases/message/send-message.use-case.js';
import { GetMessagesUseCase } from '../../application/use-cases/message/get-messages.use-case.js';
import { EditMessageUseCase } from '../../application/use-cases/message/edit-message.use-case.js';
import { DeleteMessageUseCase } from '../../application/use-cases/message/delete-message.use-case.js';

export class MessageController {
  private readonly chatRepository = new PrismaChatRepository();

  private readonly messageRepository = new PrismaMessageRepository();

  private readonly sendMessageUseCase = new SendMessageUseCase(
    this.chatRepository,
    this.messageRepository,
  );

  private readonly getMessagesUseCase = new GetMessagesUseCase(
    this.chatRepository,
    this.messageRepository,
  );

  private readonly editMessageUseCase = new EditMessageUseCase(this.messageRepository);

  private readonly deleteMessageUseCase = new DeleteMessageUseCase(this.messageRepository);

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const message = await this.sendMessageUseCase.execute({
        chatId: String(req.params.chatId),
        senderId: req.user.id,
        content: req.body.content,
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
}
