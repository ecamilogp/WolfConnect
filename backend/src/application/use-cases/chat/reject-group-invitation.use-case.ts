import { GroupInvitationRepository } from '../../../domain/repositories/group-invitation.repository.js';
import { ConflictError } from '../../../shared/errors/conflict-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class RejectGroupInvitationUseCase {
  constructor(private readonly groupInvitationRepository: GroupInvitationRepository) {}

  async execute(invitationId: string, currentUserId: string): Promise<{ message: string }> {
    const invitation = await this.groupInvitationRepository.findById(invitationId);

    if (!invitation) {
      throw new NotFoundError('Invitation not found.');
    }

    if (invitation.invitedUserId !== currentUserId) {
      throw new ForbiddenError('You are not allowed to reject this invitation.');
    }

    if (invitation.status !== 'PENDING') {
      throw new ConflictError('Invitation has already been processed.');
    }

    await this.groupInvitationRepository.updateStatus(invitation.id, 'REJECTED');

    return {
      message: 'Invitation rejected successfully.',
    };
  }
}
