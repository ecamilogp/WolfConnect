import { MessageType, SystemEventType } from '@prisma/client';

import { AttachmentResponseDto } from '../attachment/attachment-response.dto.js';
import { MessageReactionSummaryDto } from './message-reaction-summary.dto.js';
import { MessageSenderSummaryDto } from './message-sender-summary.dto.js';
import { ReplyToMessageDto } from './reply-to-message.dto.js';

export interface MessageResponseDto {
  id: string;
  chatId: string;
  senderId: string | null;
  sender: MessageSenderSummaryDto | null;
  content: string | null;
  type: MessageType;
  systemEventType: SystemEventType | null;
  systemEventPayload: Record<string, unknown> | null;
  isReadByAll: boolean;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  replyTo: ReplyToMessageDto | null;
  reactions: MessageReactionSummaryDto[];
  attachments: AttachmentResponseDto[];
}
