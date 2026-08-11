import { PendingInvitationSummaryDto } from '../../../domain/dto/chat-group-invitations/pending-invitation-summary.dto.js';
import { GroupInvitationRepository } from '../../../domain/repositories/group-invitation.repository.js';

export class GetPendingInvitationsUseCase {
  constructor(private readonly groupInvitationRepository: GroupInvitationRepository) {}

  async execute(userId: string): Promise<PendingInvitationSummaryDto[]> {
    return this.groupInvitationRepository.findPendingByInvitedUser(userId);
  }
}
