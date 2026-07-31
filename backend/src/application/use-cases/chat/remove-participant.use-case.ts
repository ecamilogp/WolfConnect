import { RemoveParticipantDto } from '../../../domain/dto/chat/remove-participant.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class RemoveParticipantUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(dto: RemoveParticipantDto): Promise<{ message: string }> {
    const chat = await this.chatRepository.findById(dto.chatId);

    if (!chat || chat.deletedAt) {
      throw new NotFoundError('Group not found.');
    }

    if (dto.requesterUserId === dto.targetUserId) {
      throw new BadRequestError('You cannot remove yourself. Use leave group instead.');
    }

    const requester = await this.chatRepository.findParticipantByUser(
      dto.chatId,
      dto.requesterUserId,
    );

    if (!requester || requester.leftAt) {
      throw new ForbiddenError('You are not a participant of this group.');
    }

    if (requester.role !== 'OWNER' && requester.role !== 'ADMIN') {
      throw new ForbiddenError('Only the group owner or an admin can remove a participant.');
    }

    const target = await this.chatRepository.findParticipantByUser(dto.chatId, dto.targetUserId);

    if (!target || target.leftAt) {
      throw new NotFoundError('Participant not found in this group.');
    }

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
