import { PromoteToAdminDto } from '../../../domain/dto/chat/promote-to-admin.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import {
  requireActiveGroup,
  requireActiveTargetParticipant,
  requireGroupOwner,
} from './group-admin.guards.js';

export class PromoteToAdminUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(dto: PromoteToAdminDto): Promise<{ message: string }> {
    await requireActiveGroup(this.chatRepository, dto.chatId);

    if (dto.requesterUserId === dto.targetUserId) {
      throw new BadRequestError('You cannot change your own role.');
    }

    await requireGroupOwner(
      this.chatRepository,
      dto.chatId,
      dto.requesterUserId,
      'Only the group owner can promote a member to admin.',
    );

    const target = await requireActiveTargetParticipant(
      this.chatRepository,
      dto.chatId,
      dto.targetUserId,
    );

    if (target.role !== 'MEMBER') {
      throw new BadRequestError('Only a member can be promoted to admin.');
    }

    await this.chatRepository.updateParticipantRole(dto.chatId, dto.targetUserId, 'ADMIN');

    return { message: 'Member promoted to admin successfully.' };
  }
}
