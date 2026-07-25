import { CreateGroupChatDto } from '../dto/chat/create-group-chat.dto.js';
import { Chat } from '../entities/chat.entity.js';

export interface ChatRepository {
  findPrivateChatBetweenUsers(currentUserId: string, targetUserId: string): Promise<Chat | null>;

  createPrivateChat(currentUserId: string, targetUserId: string): Promise<Chat>;

  createGroupChat(dto: CreateGroupChatDto): Promise<Chat>;
}
