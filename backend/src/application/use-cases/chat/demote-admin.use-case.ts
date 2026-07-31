import { DemoteAdminDto } from '../../../domain/dto/chat/demote-admin.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class DemoteAdminUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(dto: DemoteAdminDto): Promise<{ message: string }> {
    const chat = await this.chatRepository.findById(dto.chatId);

    if (!chat || chat.deletedAt) {
      throw new NotFoundError('Group not found.');
    }

    if (dto.requesterUserId === dto.targetUserId) {
      throw new BadRequestError('You cannot change your own role.');
    }

    const requester = await this.chatRepository.findParticipantByUser(
      dto.chatId,
      dto.requesterUserId,
    );

    if (!requester || requester.leftAt || requester.role !== 'OWNER') {
      throw new ForbiddenError('Only the group owner can remove an admin.');
    }

    const target = await this.chatRepository.findParticipantByUser(dto.chatId, dto.targetUserId);

    if (!target || target.leftAt) {
      throw new NotFoundError('Participant not found in this group.');
    }

    if (target.role !== 'ADMIN') {
      throw new BadRequestError('Only an admin can be demoted to member.');
    }

    await this.chatRepository.updateParticipantRole(dto.chatId, dto.targetUserId, 'MEMBER');

    return { message: 'Admin demoted to member successfully.' };
  }
}
