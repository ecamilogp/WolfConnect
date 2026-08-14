import { Chat, ChatProps } from '../../src/domain/entities/chat.entity.js';
import { ChatParticipant } from '../../src/domain/entities/chat-participant.entity.js';
import { ChatRepository } from '../../src/domain/repositories/chat.repository.js';
import { ChatSummaryDto } from '../../src/domain/dto/chat/chat-summary.dto.js';
import { CreateGroupChatDto } from '../../src/domain/dto/chat/create-group-chat.dto.js';
import { UpdateGroupDto } from '../../src/domain/dto/chat/update-group.dto.js';
import { GroupParticipantSummaryDto } from '../../src/domain/dto/chat/group-participant-summary.dto.js';
import { AcceptGroupInvitationDto } from '../../src/domain/dto/chat-group-invitations/accept-group-invitation.dto.js';
import { MessageResponseDto } from '../../src/domain/dto/message/message-response.dto.js';

export function buildChat(overrides: Partial<ChatProps> = {}): Chat {
  const base: ChatProps = {
    id: 'chat-1',
    type: 'GROUP',
    name: 'Test Group',
    description: null,
    imageUrl: null,
    joinPolicy: 'AUTO_ADD',
    lastMessageAt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    deletedAt: null,
  };

  return new Chat({ ...base, ...overrides });
}

export function buildParticipant(overrides: Partial<ChatParticipant> = {}): ChatParticipant {
  return {
    id: `participant-${overrides.userId ?? 'x'}`,
    chatId: 'chat-1',
    userId: 'user-1',
    role: 'MEMBER',
    joinedAt: new Date('2026-01-01T00:00:00Z'),
    leftAt: null,
    ...overrides,
  };
}

export function buildSystemMessage(overrides: Partial<MessageResponseDto> = {}): MessageResponseDto {
  return {
    id: 'system-message-1',
    chatId: 'chat-1',
    senderId: null,
    sender: null,
    content: null,
    type: 'SYSTEM',
    systemEventType: 'PARTICIPANT_LEFT',
    systemEventPayload: null,
    isReadByAll: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    editedAt: null,
    deletedAt: null,
    replyTo: null,
    reactions: [],
    attachments: [],
    ...overrides,
  };
}

export interface FakeChatRepositoryOptions {
  chat?: Chat | null;
  participants?: ChatParticipant[];
}

/**
 * In-memory stand-in for `ChatRepository`, covering only the methods the
 * group-membership use cases actually call. Anything else throws, so an
 * accidental new dependency on an unimplemented method fails loudly in the
 * test instead of silently returning `undefined`.
 */
export class FakeChatRepository implements ChatRepository {
  chat: Chat | null;
  participants: ChatParticipant[];
  systemMessage: MessageResponseDto;

  readonly leaveGroupCalls: Array<{ chatId: string; userId: string }> = [];
  readonly removeParticipantCalls: Array<{ chatId: string; userId: string }> = [];
  readonly addParticipantCalls: Array<{ chatId: string; userId: string }> = [];
  readonly acceptGroupInvitationCalls: AcceptGroupInvitationDto[] = [];
  readonly updateParticipantRoleCalls: Array<{
    chatId: string;
    userId: string;
    role: ChatParticipant['role'];
  }> = [];
  readonly transferOwnershipCalls: Array<{
    chatId: string;
    currentOwnerUserId: string;
    newOwnerUserId: string;
  }> = [];

  constructor(options: FakeChatRepositoryOptions = {}) {
    this.chat = options.chat === undefined ? buildChat() : options.chat;
    this.participants = options.participants ?? [];
    this.systemMessage = buildSystemMessage();
  }

  async findPrivateChatBetweenUsers(): Promise<Chat | null> {
    throw new Error('findPrivateChatBetweenUsers is not implemented in this fake.');
  }

  async createPrivateChat(): Promise<Chat> {
    throw new Error('createPrivateChat is not implemented in this fake.');
  }

  async createGroupChat(_dto: CreateGroupChatDto): Promise<Chat> {
    throw new Error('createGroupChat is not implemented in this fake.');
  }

  async findById(chatId: string): Promise<Chat | null> {
    if (this.chat && this.chat.id === chatId) {
      return this.chat;
    }

    return null;
  }

  async findParticipantByUser(chatId: string, userId: string): Promise<ChatParticipant | null> {
    return (
      this.participants.find((participant) => participant.chatId === chatId && participant.userId === userId) ??
      null
    );
  }

  async findParticipantIds(chatId: string): Promise<string[]> {
    return this.participants
      .filter((participant) => participant.chatId === chatId && !participant.leftAt)
      .map((participant) => participant.userId);
  }

  async findParticipants(): Promise<GroupParticipantSummaryDto[]> {
    throw new Error('findParticipants is not implemented in this fake.');
  }

  async findParticipantSummary(): Promise<GroupParticipantSummaryDto | null> {
    return null;
  }

  async addParticipant(chatId: string, userId: string): Promise<MessageResponseDto> {
    this.addParticipantCalls.push({ chatId, userId });

    const existing = await this.findParticipantByUser(chatId, userId);

    if (existing) {
      existing.leftAt = null;
    } else {
      this.participants.push(buildParticipant({ chatId, userId, role: 'MEMBER' }));
    }

    return this.systemMessage;
  }

  async acceptGroupInvitation(dto: AcceptGroupInvitationDto): Promise<MessageResponseDto> {
    this.acceptGroupInvitationCalls.push(dto);

    const existing = await this.findParticipantByUser(dto.chatId, dto.userId);

    if (existing) {
      existing.leftAt = null;
    } else {
      this.participants.push(buildParticipant({ chatId: dto.chatId, userId: dto.userId, role: 'MEMBER' }));
    }

    return this.systemMessage;
  }

  async leaveGroup(chatId: string, userId: string): Promise<MessageResponseDto> {
    this.leaveGroupCalls.push({ chatId, userId });

    const participant = await this.findParticipantByUser(chatId, userId);

    if (participant) {
      participant.leftAt = new Date();
    }

    return this.systemMessage;
  }

  async deleteGroup(): Promise<void> {
    throw new Error('deleteGroup is not implemented in this fake.');
  }

  async findAllByUser(): Promise<ChatSummaryDto[]> {
    throw new Error('findAllByUser is not implemented in this fake.');
  }

  async updateGroup(_dto: UpdateGroupDto): Promise<Chat> {
    throw new Error('updateGroup is not implemented in this fake.');
  }

  async updateParticipantRole(
    chatId: string,
    userId: string,
    role: ChatParticipant['role'],
  ): Promise<void> {
    this.updateParticipantRoleCalls.push({ chatId, userId, role });

    const participant = await this.findParticipantByUser(chatId, userId);

    if (participant) {
      participant.role = role;
    }
  }

  async removeParticipant(chatId: string, userId: string): Promise<MessageResponseDto> {
    this.removeParticipantCalls.push({ chatId, userId });

    const participant = await this.findParticipantByUser(chatId, userId);

    if (participant) {
      participant.leftAt = new Date();
    }

    return this.systemMessage;
  }

  async transferOwnership(
    chatId: string,
    currentOwnerUserId: string,
    newOwnerUserId: string,
  ): Promise<void> {
    this.transferOwnershipCalls.push({ chatId, currentOwnerUserId, newOwnerUserId });

    const currentOwner = await this.findParticipantByUser(chatId, currentOwnerUserId);
    const newOwner = await this.findParticipantByUser(chatId, newOwnerUserId);

    if (currentOwner) {
      currentOwner.role = 'ADMIN';
    }

    if (newOwner) {
      newOwner.role = 'OWNER';
    }
  }
}
