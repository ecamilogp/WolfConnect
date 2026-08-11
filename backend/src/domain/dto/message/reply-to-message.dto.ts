import { MessageType } from '@prisma/client';

export interface ReplyToMessageDto {
  id: string;
  senderId: string | null;
  content: string | null;
  type: MessageType;
}
