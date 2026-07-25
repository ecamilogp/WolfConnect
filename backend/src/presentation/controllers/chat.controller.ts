import { NextFunction, Request, Response } from 'express';

import { CreatePrivateChatUseCase } from '../../application/use-cases/chat/create-private-chat.use-case.js';
import { PrismaChatRepository } from '../../infrastructure/repositories/prisma-chat.repository.js';
import { ChatResponseMapper } from '../mappers/chat-response.mapper.js';

export class ChatController {
  private readonly chatRepository = new PrismaChatRepository();

  private readonly createPrivateChatUseCase = new CreatePrivateChatUseCase(this.chatRepository);

  createPrivateChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chat = await this.createPrivateChatUseCase.execute({
        currentUserId: req.user.id,
        targetUserId: req.body.targetUserId,
      });

      const response = ChatResponseMapper.toResponse(chat);

      res.status(201).json({
        success: true,
        message: 'Private chat created successfully.',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };
}
