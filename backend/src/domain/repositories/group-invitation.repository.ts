import { InvitationStatus } from '@prisma/client';
import { CreateGroupInvitationDto } from '../dto/chat-group-invitations/create-group-invitation.dto.js';
import { PendingInvitationSummaryDto } from '../dto/chat-group-invitations/pending-invitation-summary.dto.js';
import { GroupInvitation } from '../entities/group-invitation.entity.js';

export interface GroupInvitationRepository {
  findPendingInvitation(chatId: string, invitedUserId: string): Promise<GroupInvitation | null>;

  findPendingByInvitedUser(invitedUserId: string): Promise<PendingInvitationSummaryDto[]>;

  create(dto: CreateGroupInvitationDto): Promise<GroupInvitation>;

  findById(id: string): Promise<GroupInvitation | null>;

  updateStatus(
    id: string,
    status: Exclude<InvitationStatus, 'PENDING'>,
  ): Promise<GroupInvitation>;
}
