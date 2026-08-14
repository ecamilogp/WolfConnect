import { ParticipantRole } from '@prisma/client';
import { AttachmentResponseDto } from '../../../domain/dto/attachment/attachment-response.dto.js';
import { ChatSummaryDto } from '../../../domain/dto/chat/chat-summary.dto.js';
import { GroupParticipantSummaryDto } from '../../../domain/dto/chat/group-participant-summary.dto.js';
import { MessageReactionSummaryDto } from '../../../domain/dto/message/message-reaction-summary.dto.js';
import { MessageResponseDto } from '../../../domain/dto/message/message-response.dto.js';
import { NotificationResponseDto } from '../../../domain/dto/notification/notification-response.dto.js';
import { Chat } from '../../../domain/entities/chat.entity.js';

export interface ChatJoinPayload {
  chatId: string;
}

export interface ChatLeavePayload {
  chatId: string;
}

export interface MessageSendPayload {
  chatId: string;
  content: string;
  replyToMessageId?: string;
}

export interface MessageEditPayload {
  messageId: string;
  content: string;
}

export interface MessageDeletePayload {
  messageId: string;
}

export interface ChatJoinedPayload {
  chat: ChatSummaryDto;
}

export interface ChatLeftPayload {
  chatId: string;
}

export type MessageNewPayload = MessageResponseDto;
export type MessageEditedPayload = MessageResponseDto;

export interface MessageDeletedPayload {
  messageId: string;
  chatId: string;
}

export interface PresenceChangedPayload {
  userId: string;
}

export interface PresenceSnapshotPayload {
  onlineUserIds: string[];
}

export interface AttachmentUploadedPayload {
  messageId: string;
  chatId: string;
  attachment: AttachmentResponseDto;
}

export interface MessageReactionUpdatedPayload {
  messageId: string;
  chatId: string;
  reactions: MessageReactionSummaryDto[];
}

export interface MessageReadUpdatedPayload {
  chatId: string;
  messageIds: string[];
}

export type GroupUpdatedPayload = Chat;

export interface GroupRoleChangedPayload {
  chatId: string;
  userId: string;
  role: ParticipantRole;
}

export interface GroupParticipantAddedPayload {
  chatId: string;
  participant: GroupParticipantSummaryDto;
}

export interface GroupParticipantRemovedPayload {
  chatId: string;
  userId: string;
}

export interface GroupOwnershipTransferredPayload {
  chatId: string;
  previousOwnerId: string;
  newOwnerId: string;
}

export type NotificationNewPayload = NotificationResponseDto;

export interface AppErrorPayload {
  code: string;
  message: string;
}
