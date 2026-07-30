import { InviteUserToGroupDto } from '../../../domain/dto/chat/invite-user-to-group.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';
import { GroupInvitationRepository } from '../../../domain/repositories/group-invitation.repository.js';
import { NotificationType } from '../../../shared/constants/notification-types.constant.js';
import { SendNotificationUseCase } from '../notification/send-notification.use-case.js';

export class InviteUserToGroupUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly userRepository: UserRepository,
    private readonly groupInvitationRepository: GroupInvitationRepository,
    private readonly sendNotificationUseCase: SendNotificationUseCase,
  ) {}

  async execute(dto: InviteUserToGroupDto): Promise<void> {
    const group = await this.chatRepository.findById(dto.chatId);

    if (!group) {
      throw new NotFoundError('Group not found.');
    }

    if (group.deletedAt) {
      throw new NotFoundError('Group not found.');
    }

    if (group.type !== 'GROUP') {
      throw new BadRequestError('Chat is not a group.');
    }

    const invitedUser = await this.userRepository.findById(dto.invitedUserId);

    if (!invitedUser) {
      throw new NotFoundError('User not found.');
    }

    if (dto.inviterUserId === dto.invitedUserId) {
      throw new BadRequestError('You cannot invite yourself to the group.');
    }

    const inviter = await this.chatRepository.findParticipantByUser(dto.chatId, dto.inviterUserId);

    if (!inviter) {
      throw new BadRequestError('You are not a participant of this group.');
    }

    if (inviter.role !== 'OWNER' && inviter.role !== 'ADMIN') {
      throw new BadRequestError('You do not have permission to invite users to this group.');
    }

    const invitedParticipant = await this.chatRepository.findParticipantByUser(
      dto.chatId,
      dto.invitedUserId,
    );

    if (invitedParticipant) {
      throw new BadRequestError('User is already a participant of this group.');
    }

    const pendingInvitation = await this.groupInvitationRepository.findPendingInvitation(
      dto.chatId,
      dto.invitedUserId,
    );

    if (pendingInvitation) {
      throw new BadRequestError('The user already has a pending invitation to this group.');
    }

    const inviterUser = await this.userRepository.findById(dto.inviterUserId);
    const inviterName = inviterUser ? `${inviterUser.firstName} ${inviterUser.lastName}` : 'Someone';
    const groupName = group.name ?? 'the group';

    if (group.joinPolicy === 'AUTO_ADD') {
      await this.chatRepository.addParticipant(dto.chatId, dto.invitedUserId);

      await this.sendNotificationUseCase.execute({
        userId: dto.invitedUserId,
        type: NotificationType.GROUP_MEMBER_JOINED,
        title: 'Added to group',
        body: `You were added to "${groupName}".`,
        data: { chatId: dto.chatId },
      });

      const otherParticipantIds = (await this.chatRepository.findParticipantIds(dto.chatId)).filter(
        (userId) => userId !== dto.invitedUserId && userId !== dto.inviterUserId,
      );

      await Promise.all(
        otherParticipantIds.map((userId) =>
          this.sendNotificationUseCase.execute({
            userId,
            type: NotificationType.GROUP_MEMBER_JOINED,
            title: 'New member',
            body: `${invitedUser.firstName} ${invitedUser.lastName} joined "${groupName}".`,
            data: { chatId: dto.chatId, newMemberId: dto.invitedUserId },
          }),
        ),
      );

      return;
    }

    if (group.joinPolicy === 'INVITATION_REQUIRED') {
      await this.groupInvitationRepository.create({
        chatId: dto.chatId,
        invitedByUserId: dto.inviterUserId,
        invitedUserId: dto.invitedUserId,
      });

      await this.sendNotificationUseCase.execute({
        userId: dto.invitedUserId,
        type: NotificationType.GROUP_INVITATION,
        title: 'Group invitation',
        body: `${inviterName} invited you to join "${groupName}".`,
        data: { chatId: dto.chatId, invitedByUserId: dto.inviterUserId },
      });

      return;
    }

    await this.groupInvitationRepository.create({
      chatId: dto.chatId,
      invitedByUserId: dto.inviterUserId,
      invitedUserId: dto.invitedUserId,
    });

    await this.sendNotificationUseCase.execute({
      userId: dto.invitedUserId,
      type: NotificationType.GROUP_INVITATION,
      title: 'Group invitation',
      body: `${inviterName} invited you to join "${groupName}".`,
      data: { chatId: dto.chatId, invitedByUserId: dto.inviterUserId },
    });
  }
}
