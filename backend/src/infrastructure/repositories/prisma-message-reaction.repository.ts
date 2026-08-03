import { MessageReactionResponseDto } from '../../domain/dto/message-reaction/message-reaction-response.dto.js';
import { RemoveMessageReactionDto } from '../../domain/dto/message-reaction/remove-message-reaction.dto.js';
import { SetMessageReactionDto } from '../../domain/dto/message-reaction/set-message-reaction.dto.js';
import { MessageReactionRepository } from '../../domain/repositories/message-reaction.repository.js';
import { prisma } from '../database/prisma.service.js';

export class PrismaMessageReactionRepository implements MessageReactionRepository {
  async upsert(dto: SetMessageReactionDto): Promise<MessageReactionResponseDto> {
    const reaction = await prisma.messageReaction.upsert({
      where: {
        messageId_userId: {
          messageId: dto.messageId,
          userId: dto.userId,
        },
      },
      create: {
        messageId: dto.messageId,
        userId: dto.userId,
        emoji: dto.emoji,
      },
      update: {
        emoji: dto.emoji,
      },
    });

    return {
      id: reaction.id,
      messageId: reaction.messageId,
      userId: reaction.userId,
      emoji: reaction.emoji,
      createdAt: reaction.createdAt,
    };
  }

  async remove(dto: RemoveMessageReactionDto): Promise<void> {
    await prisma.messageReaction.deleteMany({
      where: {
        messageId: dto.messageId,
        userId: dto.userId,
      },
    });
  }
}
