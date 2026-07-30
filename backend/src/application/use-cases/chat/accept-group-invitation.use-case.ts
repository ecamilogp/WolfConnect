import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { GroupInvitationRepository } from '../../../domain/repositories/group-invitation.repository.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { ConflictError } from '../../../shared/errors/conflict-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotificationType } from '../../../shared/constants/notification-types.constant.js';
import { SendNotificationUseCase } from '../notification/send-notification.use-case.js';

export class AcceptGroupInvitationUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly groupInvitationRepository: GroupInvitationRepository,
    private readonly userRepository: UserRepository,
    private readonly sendNotificationUseCase: SendNotificationUseCase,
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

    const [group, acceptedByUser] = await Promise.all([
      this.chatRepository.findById(invitation.chatId),
      this.userRepository.findById(currentUserId),
    ]);

    const groupName = group?.name ?? 'the group';
    const acceptedByName = acceptedByUser
      ? `${acceptedByUser.firstName} ${acceptedByUser.lastName}`
      : 'Someone';

    await this.sendNotificationUseCase.execute({
      userId: invitation.invitedByUserId,
      type: NotificationType.GROUP_INVITATION_ACCEPTED,
      title: 'Invitation accepted',
      body: `${acceptedByName} accepted your invitation to join "${groupName}".`,
      data: { chatId: invitation.chatId, acceptedByUserId: currentUserId },
    });

    return {
      message: 'Invitation accepted successfully.',
    };
  }
}
