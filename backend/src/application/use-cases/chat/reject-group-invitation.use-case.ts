import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { GroupInvitationRepository } from '../../../domain/repositories/group-invitation.repository.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { ConflictError } from '../../../shared/errors/conflict-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';
import { NotificationType } from '../../../shared/constants/notification-types.constant.js';
import { SendNotificationUseCase } from '../notification/send-notification.use-case.js';

export class RejectGroupInvitationUseCase {
  constructor(
    private readonly groupInvitationRepository: GroupInvitationRepository,
    private readonly chatRepository: ChatRepository,
    private readonly userRepository: UserRepository,
    private readonly sendNotificationUseCase: SendNotificationUseCase,
  ) {}

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

    const [group, rejectedByUser] = await Promise.all([
      this.chatRepository.findById(invitation.chatId),
      this.userRepository.findById(currentUserId),
    ]);

    const groupName = group?.name ?? 'the group';
    const rejectedByName = rejectedByUser
      ? `${rejectedByUser.firstName} ${rejectedByUser.lastName}`
      : 'Someone';

    await this.sendNotificationUseCase.execute({
      userId: invitation.invitedByUserId,
      type: NotificationType.GROUP_INVITATION_REJECTED,
      title: 'Invitation declined',
      body: `${rejectedByName} declined your invitation to join "${groupName}".`,
      data: {
        chatId: invitation.chatId,
        rejectedByUserId: currentUserId,
        actorName: rejectedByName,
        groupName,
      },
    });

    return {
      message: 'Invitation rejected successfully.',
    };
  }
}
