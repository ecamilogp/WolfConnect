import { ChatType } from '../../entities/chat.entity.js';

export interface ChatSummaryDto {
  id: string;
  type: ChatType;
  name: string;
  imageUrl: string | null;
  unreadCount: number;
}
