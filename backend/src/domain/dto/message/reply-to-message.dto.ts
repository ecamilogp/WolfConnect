import { MessageType } from '@prisma/client';

export interface ReplyToMessageDto {
  id: string;
  senderId: string;
  content: string | null;
  type: MessageType;
}
