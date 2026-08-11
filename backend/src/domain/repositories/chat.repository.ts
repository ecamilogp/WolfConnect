import { ChatSummaryDto } from '../dto/chat/chat-summary.dto.js';
import { CreateGroupChatDto } from '../dto/chat/create-group-chat.dto.js';
import { UpdateGroupDto } from '../dto/chat/update-group.dto.js';
import { GroupParticipantSummaryDto } from '../dto/chat/group-participant-summary.dto.js';
import { AcceptGroupInvitationDto } from '../dto/chat-group-invitations/accept-group-invitation.dto.js';
import { MessageResponseDto } from '../dto/message/message-response.dto.js';
import { ChatParticipant } from '../entities/chat-participant.entity.js';
import { Chat } from '../entities/chat.entity.js';

export interface ChatRepository {
  findPrivateChatBetweenUsers(currentUserId: string, targetUserId: string): Promise<Chat | null>;

  createPrivateChat(currentUserId: string, targetUserId: string): Promise<Chat>;

  createGroupChat(dto: CreateGroupChatDto): Promise<Chat>;

  findById(chatId: string): Promise<Chat | null>;

  findParticipantByUser(chatId: string, userId: string): Promise<ChatParticipant | null>;

  findParticipantIds(chatId: string): Promise<string[]>;

  findParticipants(chatId: string): Promise<GroupParticipantSummaryDto[]>;

  findParticipantSummary(chatId: string, userId: string): Promise<GroupParticipantSummaryDto | null>;

  addParticipant(chatId: string, userId: string): Promise<MessageResponseDto>;

  acceptGroupInvitation(dto: AcceptGroupInvitationDto): Promise<MessageResponseDto>;

  leaveGroup(chatId: string, userId: string): Promise<MessageResponseDto>;

  deleteGroup(chatId: string): Promise<void>;

  findAllByUser(userId: string): Promise<ChatSummaryDto[]>;

  updateGroup(dto: UpdateGroupDto): Promise<Chat>;

  updateParticipantRole(chatId: string, userId: string, role: ChatParticipant['role']): Promise<void>;

  removeParticipant(chatId: string, userId: string): Promise<MessageResponseDto>;

  transferOwnership(chatId: string, currentOwnerUserId: string, newOwnerUserId: string): Promise<void>;
}
