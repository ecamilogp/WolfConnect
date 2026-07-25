import { Chat } from '../entities/chat.entity.js';

export interface ChatRepository {
  findPrivateChatBetweenUsers(currentUserId: string, targetUserId: string): Promise<Chat | null>;

  createPrivateChat(currentUserId: string, targetUserId: string): Promise<Chat>;
}
