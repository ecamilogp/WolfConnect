import { AttachmentResponseDto } from '../../../domain/dto/attachment/attachment-response.dto.js';
import { ChatSummaryDto } from '../../../domain/dto/chat/chat-summary.dto.js';
import { MessageReactionSummaryDto } from '../../../domain/dto/message/message-reaction-summary.dto.js';
import { MessageResponseDto } from '../../../domain/dto/message/message-response.dto.js';
import { NotificationResponseDto } from '../../../domain/dto/notification/notification-response.dto.js';

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

export type NotificationNewPayload = NotificationResponseDto;

export interface AppErrorPayload {
  code: string;
  message: string;
}
