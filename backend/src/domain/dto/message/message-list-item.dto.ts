import { MessageType } from '@prisma/client';

export interface MessageListItemDto {
  id: string;
  senderId: string;
  content: string | null;
  type: MessageType;
  createdAt: Date;
  editedAt: Date | null;
}
