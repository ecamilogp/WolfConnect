import { ChatSummaryDto } from '../dto/chat/chat-summary.dto.js';
import { CreateGroupChatDto } from '../dto/chat/create-group-chat.dto.js';
import { AcceptGroupInvitationDto } from '../dto/chat-group-invitations/accept-group-invitation.dto.js';
import { ChatParticipant } from '../entities/chat-participant.entity.js';
import { Chat } from '../entities/chat.entity.js';

export interface ChatRepository {
  findPrivateChatBetweenUsers(currentUserId: string, targetUserId: string): Promise<Chat | null>;

  createPrivateChat(currentUserId: string, targetUserId: string): Promise<Chat>;

  createGroupChat(dto: CreateGroupChatDto): Promise<Chat>;

  findById(chatId: string): Promise<Chat | null>;

  findParticipantByUser(chatId: string, userId: string): Promise<ChatParticipant | null>;

  findParticipantIds(chatId: string): Promise<string[]>;

  addParticipant(chatId: string, userId: string): Promise<void>;

  acceptGroupInvitation(dto: AcceptGroupInvitationDto): Promise<void>;

  leaveGroup(chatId: string, userId: string): Promise<void>;

  deleteGroup(chatId: string): Promise<void>;

  findAllByUser(userId: string): Promise<ChatSummaryDto[]>;
}
