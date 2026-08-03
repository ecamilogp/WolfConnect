import { MessageType } from '@prisma/client';

import { MessageReactionSummaryDto } from './message-reaction-summary.dto.js';
import { ReplyToMessageDto } from './reply-to-message.dto.js';

export interface MessageListItemDto {
  id: string;
  senderId: string;
  content: string | null;
  type: MessageType;
  createdAt: Date;
  editedAt: Date | null;
  replyTo: ReplyToMessageDto | null;
  reactions: MessageReactionSummaryDto[];
}
