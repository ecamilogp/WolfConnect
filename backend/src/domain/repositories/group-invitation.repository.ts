import { CreateGroupInvitationDto } from '../dto/group-invitations/create-group-invitation.dto.js';
import { GroupInvitation } from '../entities/group-invitation.entity.js';

export interface GroupInvitationRepository {
  findPendingInvitation(chatId: string, invitedUserId: string): Promise<GroupInvitation | null>;

  create(dto: CreateGroupInvitationDto): Promise<GroupInvitation>;

  findById(id: string): Promise<GroupInvitation | null>;

  updateStatus(id: string, status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED'): Promise<GroupInvitation>;
}
