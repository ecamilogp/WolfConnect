import type { ChatType, GroupJoinPolicy } from '../../domain/entities/chat.entity.js';

export interface ChatResponse {
  id: string;
  type: ChatType;

  name: string | null;
  description: string | null;
  imageUrl: string | null;

  joinPolicy: GroupJoinPolicy | null;

  lastMessageAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}
