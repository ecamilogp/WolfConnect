import { Prisma } from '@prisma/client';

import { MessageListItemDto } from '../../domain/dto/message/message-list-item.dto.js';
import { MessageReactionSummaryDto } from '../../domain/dto/message/message-reaction-summary.dto.js';
import { MessageResponseDto } from '../../domain/dto/message/message-response.dto.js';
import { MessageSenderSummaryDto } from '../../domain/dto/message/message-sender-summary.dto.js';
import { ReplyToMessageDto } from '../../domain/dto/message/reply-to-message.dto.js';

export type MessageWithRelations = Prisma.MessageGetPayload<{
  include: { sender: true; replyTo: true; reactions: true };
}>;

export class MessageMapper {
  static toSenderSummary(
    sender: MessageWithRelations['sender'],
  ): MessageSenderSummaryDto | null {
    if (!sender) {
      return null;
    }

    return {
      id: sender.id,
      firstName: sender.firstName,
      lastName: sender.lastName,
      profileImage: sender.profileImage,
    };
  }

  static toReplyToDto(replyTo: MessageWithRelations['replyTo']): ReplyToMessageDto | null {
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

  static toReactionsSummary(
    reactions: MessageWithRelations['reactions'],
  ): MessageReactionSummaryDto[] {
    return reactions.map((reaction) => ({
      userId: reaction.userId,
      emoji: reaction.emoji,
    }));
  }

  static toResponseDto(message: MessageWithRelations): MessageResponseDto {
    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      sender: this.toSenderSummary(message.sender),
      content: message.content,
      type: message.type,
      systemEventType: message.systemEventType,
      systemEventPayload: message.systemEventPayload as Record<string, unknown> | null,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
      replyTo: this.toReplyToDto(message.replyTo),
      reactions: this.toReactionsSummary(message.reactions),
    };
  }

  static toListItemDto(message: MessageWithRelations): MessageListItemDto {
    return {
      id: message.id,
      senderId: message.senderId,
      sender: this.toSenderSummary(message.sender),
      content: message.content,
      type: message.type,
      systemEventType: message.systemEventType,
      systemEventPayload: message.systemEventPayload as Record<string, unknown> | null,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      replyTo: this.toReplyToDto(message.replyTo),
      reactions: this.toReactionsSummary(message.reactions),
    };
  }
}
