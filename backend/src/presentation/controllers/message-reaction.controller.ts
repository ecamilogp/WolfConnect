import { NextFunction, Request, Response } from 'express';

import { SetMessageReactionUseCase } from '../../application/use-cases/message-reaction/set-message-reaction.use-case.js';
import { RemoveMessageReactionUseCase } from '../../application/use-cases/message-reaction/remove-message-reaction.use-case.js';
import { PrismaChatRepository } from '../../infrastructure/repositories/prisma-chat.repository.js';
import { PrismaMessageRepository } from '../../infrastructure/repositories/prisma-message.repository.js';
import { PrismaMessageReactionRepository } from '../../infrastructure/repositories/prisma-message-reaction.repository.js';

export class MessageReactionController {
  private readonly messageRepository = new PrismaMessageRepository();

  private readonly chatRepository = new PrismaChatRepository();

  private readonly messageReactionRepository = new PrismaMessageReactionRepository();

  private readonly setMessageReactionUseCase = new SetMessageReactionUseCase(
    this.messageRepository,
    this.chatRepository,
    this.messageReactionRepository,
  );

  private readonly removeMessageReactionUseCase = new RemoveMessageReactionUseCase(
    this.messageRepository,
    this.chatRepository,
    this.messageReactionRepository,
  );

  setReaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.setMessageReactionUseCase.execute({
        messageId: String(req.params.messageId),
        userId: req.user.id,
        emoji: req.body.emoji,
      });

      res.status(200).json({
        success: true,
        message: 'Reaction set successfully.',
        data: result.reaction,
      });
    } catch (error) {
      next(error);
    }
  };

  removeReaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.removeMessageReactionUseCase.execute({
        messageId: String(req.params.messageId),
        userId: req.user.id,
      });

      res.status(200).json({
        success: true,
        message: 'Reaction removed successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}
