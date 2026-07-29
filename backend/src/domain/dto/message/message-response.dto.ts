import { MessageType } from '@prisma/client';

export interface MessageResponseDto {
  id: string;
  chatId: string;
  senderId: string;
  content: string | null;
  type: MessageType;
  createdAt: Date;
  editedAt: Date | null;
}
