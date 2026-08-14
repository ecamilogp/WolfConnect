import { GroupInvitation } from '../../src/domain/entities/group-invitation.entity.js';
import { GroupInvitationRepository } from '../../src/domain/repositories/group-invitation.repository.js';
import { CreateGroupInvitationDto } from '../../src/domain/dto/chat-group-invitations/create-group-invitation.dto.js';
import { PendingInvitationSummaryDto } from '../../src/domain/dto/chat-group-invitations/pending-invitation-summary.dto.js';

export function buildInvitation(overrides: Partial<GroupInvitation> = {}): GroupInvitation {
  return {
    id: 'invitation-1',
    chatId: 'chat-1',
    invitedByUserId: 'user-owner',
    invitedUserId: 'user-invitee',
    status: 'PENDING',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    respondedAt: null,
    ...overrides,
  };
}

export class FakeGroupInvitationRepository implements GroupInvitationRepository {
  invitations: GroupInvitation[];

  constructor(invitations: GroupInvitation[] = []) {
    this.invitations = invitations;
  }

  async findPendingInvitation(chatId: string, invitedUserId: string): Promise<GroupInvitation | null> {
    return (
      this.invitations.find(
        (invitation) =>
          invitation.chatId === chatId &&
          invitation.invitedUserId === invitedUserId &&
          invitation.status === 'PENDING',
      ) ?? null
    );
  }

  async findPendingByInvitedUser(): Promise<PendingInvitationSummaryDto[]> {
    throw new Error('findPendingByInvitedUser is not implemented in this fake.');
  }

  async create(dto: CreateGroupInvitationDto): Promise<GroupInvitation> {
    const invitation = buildInvitation({
      id: `invitation-${this.invitations.length + 1}`,
      chatId: dto.chatId,
      invitedByUserId: dto.invitedByUserId,
      invitedUserId: dto.invitedUserId,
    });

    this.invitations.push(invitation);

    return invitation;
  }

  async findById(id: string): Promise<GroupInvitation | null> {
    return this.invitations.find((invitation) => invitation.id === id) ?? null;
  }

  async updateStatus(
    id: string,
    status: Exclude<GroupInvitation['status'], 'PENDING'>,
  ): Promise<GroupInvitation> {
    const invitation = this.invitations.find((item) => item.id === id);

    if (!invitation) {
      throw new Error(`Invitation ${id} not found in fake.`);
    }

    invitation.status = status;
    invitation.respondedAt = new Date();

    return invitation;
  }
}
