import { NextFunction, Request, Response } from 'express';

import { SetMessageReactionUseCase } from '../../application/use-cases/message-reaction/set-message-reaction.use-case.js';
import { RemoveMessageReactionUseCase } from '../../application/use-cases/message-reaction/remove-message-reaction.use-case.js';
import { SocketEvents } from '../../infrastructure/websocket/events/socket-events.enum.js';
import { chatRoom } from '../../infrastructure/websocket/handlers/chat.handler.js';
import { MessageReactionUpdatedPayload } from '../../infrastructure/websocket/types/socket-payloads.type.js';
import { PrismaChatRepository } from '../../infrastructure/repositories/prisma-chat.repository.js';
import { PrismaMessageRepository } from '../../infrastructure/repositories/prisma-message.repository.js';
import { PrismaMessageReactionRepository } from '../../infrastructure/repositories/prisma-message-reaction.repository.js';
import { safeEmit } from '../../shared/utils/safe-emit.util.js';

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

  private emitReactionUpdate(payload: MessageReactionUpdatedPayload): void {
    safeEmit(chatRoom(payload.chatId), SocketEvents.MESSAGE_REACTION_UPDATED, payload, 'message-reaction');
  }

  setReaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.setMessageReactionUseCase.execute({
        messageId: String(req.params.messageId),
        userId: req.user.id,
        emoji: req.body.emoji,
      });

      this.emitReactionUpdate({
        messageId: result.messageId,
        chatId: result.chatId,
        reactions: result.reactions,
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
      const result = await this.removeMessageReactionUseCase.execute({
        messageId: String(req.params.messageId),
        userId: req.user.id,
      });

      this.emitReactionUpdate({
        messageId: result.messageId,
        chatId: result.chatId,
        reactions: result.reactions,
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
