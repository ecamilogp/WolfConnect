import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { GroupInvitationRepository } from '../../../domain/repositories/group-invitation.repository.js';
import { ConflictError } from '../../../shared/errors/conflict-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';

export class AcceptGroupInvitationUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly groupInvitationRepository: GroupInvitationRepository,
  ) {}

  async execute(invitationId: string, currentUserId: string) {
    const invitation = await this.groupInvitationRepository.findById(invitationId);

    if (!invitation) {
      throw new NotFoundError('Invitation not found.');
    }

    if (invitation.invitedUserId !== currentUserId) {
      throw new ForbiddenError('You are not allowed to accept this invitation.');
    }

    if (invitation.status !== 'PENDING') {
      throw new ConflictError('Invitation has already been processed.');
    }

    await this.chatRepository.acceptGroupInvitation({
      invitationId: invitation.id,
      chatId: invitation.chatId,
      userId: currentUserId,
    });
    return {
      message: 'Invitation accepted successfully.',
    };
  }
}
