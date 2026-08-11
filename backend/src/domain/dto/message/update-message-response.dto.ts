import { MessageType } from '@prisma/client';

export interface UpdateMessageResponseDto {
  id: string;
  chatId: string;
  senderId: string | null;
  content: string | null;
  type: MessageType;
  createdAt: Date;
  editedAt: Date | null;
}
