import { Prisma } from '@prisma/client';

import { CreateMessageDto } from '../../domain/dto/message/create-message.dto.js';
import { MessageResponseDto } from '../../domain/dto/message/message-response.dto.js';
import { MessageRepository } from '../../domain/repositories/message.repository.js';
import { prisma } from '../database/prisma.service.js';
import { MessageListItemDto } from '../../domain/dto/message/message-list-item.dto.js';
import { MessageReactionSummaryDto } from '../../domain/dto/message/message-reaction-summary.dto.js';
import { ReplyToMessageDto } from '../../domain/dto/message/reply-to-message.dto.js';
import { UpdateMessageResponseDto } from '../../domain/dto/message/update-message-response.dto.js';
import { UpdateMessageDto } from '../../domain/dto/message/update-message.dto.js';
import { DeleteMessageDto } from '../../domain/dto/message/delete-message.dto.js';
import { MarkMessagesAsReadDto } from '../../domain/dto/message/mark-messages-as-read.dto.js';

type MessageWithRelations = Prisma.MessageGetPayload<{
  include: { replyTo: true; reactions: true };
}>;

export class PrismaMessageRepository implements MessageRepository {
  private toReplyToDto(replyTo: MessageWithRelations['replyTo']): ReplyToMessageDto | null {
    if (!replyTo) {
      return null;
    }

    return {
      id: replyTo.id,
      senderId: replyTo.senderId,
      content: replyTo.content,
      type: replyTo.type,
    };
  }

  private toReactionsSummary(
    reactions: MessageWithRelations['reactions'],
  ): MessageReactionSummaryDto[] {
    return reactions.map((reaction) => ({
      userId: reaction.userId,
      emoji: reaction.emoji,
    }));
  }

  private toMessageResponseDto(message: MessageWithRelations): MessageResponseDto {
    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
      replyTo: this.toReplyToDto(message.replyTo),
      reactions: this.toReactionsSummary(message.reactions),
    };
  }

  async create(data: CreateMessageDto): Promise<MessageResponseDto> {
    const message = await prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          chatId: data.chatId,
          senderId: data.senderId,
          content: data.content,
          replyToMessageId: data.replyToMessageId,
        },
        include: {
          replyTo: true,
          reactions: true,
        },
      });

      await tx.chat.update({
        where: {
          id: data.chatId,
        },
        data: {
          lastMessageAt: createdMessage.createdAt,
        },
      });

      return createdMessage;
    });

    return this.toMessageResponseDto(message);
  }

  async findByChatId(chatId: string): Promise<MessageListItemDto[]> {
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        replyTo: true,
        reactions: true,
      },
    });

    return messages.map((message) => ({
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      replyTo: this.toReplyToDto(message.replyTo),
      reactions: this.toReactionsSummary(message.reactions),
    }));
  }

  async findById(messageId: string): Promise<MessageResponseDto | null> {
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
      include: {
        replyTo: true,
        reactions: true,
      },
    });

    if (!message) {
      return null;
    }

    return this.toMessageResponseDto(message);
  }

  async update(dto: UpdateMessageDto): Promise<UpdateMessageResponseDto> {
    const message = await prisma.message.update({
      where: {
        id: dto.messageId,
      },
      data: {
        content: dto.content,
        editedAt: new Date(),
      },
    });

    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
    };
  }

  async delete(dto: DeleteMessageDto): Promise<void> {
    await prisma.message.update({
      where: {
        id: dto.messageId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async markAsRead(dto: MarkMessagesAsReadDto): Promise<void> {
    const unreadMessages = await prisma.message.findMany({
      where: {
        chatId: dto.chatId,
        senderId: {
          not: dto.userId,
        },
        deletedAt: null,
        reads: {
          none: {
            userId: dto.userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (unreadMessages.length === 0) {
      return;
    }

    await prisma.messageRead.createMany({
      data: unreadMessages.map((message) => ({
        messageId: message.id,
        userId: dto.userId,
      })),
    });
  }
}
