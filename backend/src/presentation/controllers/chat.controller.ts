import { NextFunction, Request, Response } from 'express';

import { CreatePrivateChatUseCase } from '../../application/use-cases/chat/create-private-chat.use-case.js';
import { PrismaChatRepository } from '../../infrastructure/repositories/prisma-chat.repository.js';
import { ChatResponseMapper } from '../mappers/chat-response.mapper.js';
import { CreateGroupChatUseCase } from '../../application/use-cases/chat/create-group-chat.use-case.js';

export class ChatController {
  private readonly chatRepository = new PrismaChatRepository();

  private readonly createPrivateChatUseCase = new CreatePrivateChatUseCase(this.chatRepository);

  private readonly createGroupChatUseCase = new CreateGroupChatUseCase(this.chatRepository);

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

  createGroupChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chat = await this.createGroupChatUseCase.execute({
        creatorUserId: req.user.id,
        name: req.body.name,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        joinPolicy: req.body.joinPolicy,
      });

      const response = ChatResponseMapper.toResponse(chat);

      res.status(201).json({
        success: true,
        message: 'Group chat created successfully.',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };
}
