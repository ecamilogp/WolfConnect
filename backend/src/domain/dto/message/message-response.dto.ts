import { MessageType } from '@prisma/client';

import { ReplyToMessageDto } from './reply-to-message.dto.js';

export interface MessageResponseDto {
  id: string;
  chatId: string;
  senderId: string;
  content: string | null;
  type: MessageType;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  replyTo: ReplyToMessageDto | null;
}
