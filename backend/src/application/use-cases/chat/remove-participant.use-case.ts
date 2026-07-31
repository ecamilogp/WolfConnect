import { RemoveParticipantDto } from '../../../domain/dto/chat/remove-participant.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import {
  requireActiveGroup,
  requireActiveParticipant,
  requireActiveTargetParticipant,
  requireOwnerOrAdmin,
} from './group-admin.guards.js';

export class RemoveParticipantUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(dto: RemoveParticipantDto): Promise<{ message: string }> {
    await requireActiveGroup(this.chatRepository, dto.chatId);

    if (dto.requesterUserId === dto.targetUserId) {
      throw new BadRequestError('You cannot remove yourself. Use leave group instead.');
    }

    const requester = await requireActiveParticipant(
      this.chatRepository,
      dto.chatId,
      dto.requesterUserId,
    );

    requireOwnerOrAdmin(requester, 'Only the group owner or an admin can remove a participant.');

    const target = await requireActiveTargetParticipant(
      this.chatRepository,
      dto.chatId,
      dto.targetUserId,
    );

    if (target.role === 'OWNER') {
      throw new ForbiddenError('The group owner cannot be removed. Transfer ownership first.');
    }

    if (target.role === 'ADMIN' && requester.role !== 'OWNER') {
      throw new ForbiddenError('Only the group owner can remove an admin.');
    }

    await this.chatRepository.removeParticipant(dto.chatId, dto.targetUserId);

    return { message: 'Participant removed successfully.' };
  }
}
