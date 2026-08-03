import { DemoteAdminDto } from '../../../domain/dto/chat/demote-admin.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import {
  requireActiveGroup,
  requireActiveTargetParticipant,
  requireGroupOwner,
} from './group-admin.guards.js';

export class DemoteAdminUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(dto: DemoteAdminDto): Promise<{ message: string }> {
    await requireActiveGroup(this.chatRepository, dto.chatId);

    if (dto.requesterUserId === dto.targetUserId) {
      throw new BadRequestError('You cannot change your own role.');
    }

    await requireGroupOwner(
      this.chatRepository,
      dto.chatId,
      dto.requesterUserId,
      'Only the group owner can remove an admin.',
    );

    const target = await requireActiveTargetParticipant(
      this.chatRepository,
      dto.chatId,
      dto.targetUserId,
    );

    if (target.role !== 'ADMIN') {
      throw new BadRequestError('Only an admin can be demoted to member.');
    }

    await this.chatRepository.updateParticipantRole(dto.chatId, dto.targetUserId, 'MEMBER');

    return { message: 'Admin demoted to member successfully.' };
  }
}
