import { InviteUserToGroupDto } from '../../../domain/dto/chat/invite-user-to-group.dto.js';
import { MessageResponseDto } from '../../../domain/dto/message/message-response.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';
import { GroupInvitationRepository } from '../../../domain/repositories/group-invitation.repository.js';
import { NotificationType } from '../../../shared/constants/notification-types.constant.js';
import { SendNotificationUseCase } from '../notification/send-notification.use-case.js';

export type InviteUserToGroupResult =
  | { status: 'ADDED'; invitedUserId: string; systemMessage: MessageResponseDto }
  | { status: 'INVITED'; invitationId: string };

export class InviteUserToGroupUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly userRepository: UserRepository,
    private readonly groupInvitationRepository: GroupInvitationRepository,
    private readonly sendNotificationUseCase: SendNotificationUseCase,
  ) {}

  async execute(dto: InviteUserToGroupDto): Promise<InviteUserToGroupResult> {
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

    if (invitedParticipant && !invitedParticipant.leftAt) {
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
      const systemMessage = await this.chatRepository.addParticipant(
        dto.chatId,
        dto.invitedUserId,
      );

      await this.sendNotificationUseCase.execute({
        userId: dto.invitedUserId,
        type: NotificationType.ADDED_TO_GROUP,
        title: 'Added to group',
        body: `You were added to "${groupName}".`,
        data: { chatId: dto.chatId, groupName },
      });

      const otherParticipantIds = (await this.chatRepository.findParticipantIds(dto.chatId)).filter(
        (userId) => userId !== dto.invitedUserId && userId !== dto.inviterUserId,
      );

      const memberName = `${invitedUser.firstName} ${invitedUser.lastName}`;

      await Promise.all(
        otherParticipantIds.map((userId) =>
          this.sendNotificationUseCase.execute({
            userId,
            type: NotificationType.GROUP_MEMBER_JOINED,
            title: 'New member',
            body: `${memberName} joined "${groupName}".`,
            data: { chatId: dto.chatId, newMemberId: dto.invitedUserId, memberName, groupName },
          }),
        ),
      );

      return { status: 'ADDED', invitedUserId: dto.invitedUserId, systemMessage };
    }

    const invitation = await this.groupInvitationRepository.create({
      chatId: dto.chatId,
      invitedByUserId: dto.inviterUserId,
      invitedUserId: dto.invitedUserId,
    });

    await this.sendNotificationUseCase.execute({
      userId: dto.invitedUserId,
      type: NotificationType.GROUP_INVITATION,
      title: 'Group invitation',
      body: `${inviterName} invited you to join "${groupName}".`,
      data: {
        chatId: dto.chatId,
        invitationId: invitation.id,
        invitedByUserId: dto.inviterUserId,
        inviterName,
        groupName,
      },
    });

    return { status: 'INVITED', invitationId: invitation.id };
  }
}
