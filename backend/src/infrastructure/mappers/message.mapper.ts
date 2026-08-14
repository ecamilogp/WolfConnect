import { Prisma } from '@prisma/client';

import { AttachmentResponseDto } from '../../domain/dto/attachment/attachment-response.dto.js';
import { MessageListItemDto } from '../../domain/dto/message/message-list-item.dto.js';
import { MessageReactionSummaryDto } from '../../domain/dto/message/message-reaction-summary.dto.js';
import { MessageResponseDto } from '../../domain/dto/message/message-response.dto.js';
import { MessageSenderSummaryDto } from '../../domain/dto/message/message-sender-summary.dto.js';
import { ReplyToMessageDto } from '../../domain/dto/message/reply-to-message.dto.js';
import { AttachmentMapper } from './attachment.mapper.js';

export type MessageWithRelations = Prisma.MessageGetPayload<{
  include: {
    sender: true;
    replyTo: { include: { sender: true } };
    reactions: true;
    reads: { select: { userId: true } };
    attachments: true;
  };
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
      senderName: replyTo.sender
        ? `${replyTo.sender.firstName} ${replyTo.sender.lastName}`
        : null,
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

  static toAttachmentsSummary(
    attachments: MessageWithRelations['attachments'],
  ): AttachmentResponseDto[] {
    return attachments.map((attachment) => AttachmentMapper.toResponseDto(attachment));
  }

  static toIsReadByAll(message: MessageWithRelations, activeParticipantIds: string[]): boolean {
    const requiredReaderIds = activeParticipantIds.filter((id) => id !== message.senderId);

    if (requiredReaderIds.length === 0) {
      return true;
    }

    const readerIds = new Set(message.reads.map((read) => read.userId));

    return requiredReaderIds.every((id) => readerIds.has(id));
  }

  static toResponseDto(
    message: MessageWithRelations,
    activeParticipantIds: string[],
  ): MessageResponseDto {
    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      sender: this.toSenderSummary(message.sender),
      content: message.content,
      type: message.type,
      systemEventType: message.systemEventType,
      systemEventPayload: message.systemEventPayload as Record<string, unknown> | null,
      isReadByAll: this.toIsReadByAll(message, activeParticipantIds),
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
      replyTo: this.toReplyToDto(message.replyTo),
      reactions: this.toReactionsSummary(message.reactions),
      attachments: this.toAttachmentsSummary(message.attachments),
    };
  }

  static toListItemDto(
    message: MessageWithRelations,
    activeParticipantIds: string[],
  ): MessageListItemDto {
    return {
      id: message.id,
      senderId: message.senderId,
      sender: this.toSenderSummary(message.sender),
      content: message.content,
      type: message.type,
      systemEventType: message.systemEventType,
      systemEventPayload: message.systemEventPayload as Record<string, unknown> | null,
      isReadByAll: this.toIsReadByAll(message, activeParticipantIds),
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      replyTo: this.toReplyToDto(message.replyTo),
      reactions: this.toReactionsSummary(message.reactions),
      attachments: this.toAttachmentsSummary(message.attachments),
    };
  }
}
