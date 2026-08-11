import { MessageType, SystemEventType } from '@prisma/client';

import { MessageReactionSummaryDto } from './message-reaction-summary.dto.js';
import { MessageSenderSummaryDto } from './message-sender-summary.dto.js';
import { ReplyToMessageDto } from './reply-to-message.dto.js';

export interface MessageListItemDto {
  id: string;
  senderId: string | null;
  sender: MessageSenderSummaryDto | null;
  content: string | null;
  type: MessageType;
  systemEventType: SystemEventType | null;
  systemEventPayload: Record<string, unknown> | null;
  createdAt: Date;
  editedAt: Date | null;
  replyTo: ReplyToMessageDto | null;
  reactions: MessageReactionSummaryDto[];
}
