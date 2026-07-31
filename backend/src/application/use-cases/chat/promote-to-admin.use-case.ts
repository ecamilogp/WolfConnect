import { PromoteToAdminDto } from '../../../domain/dto/chat/promote-to-admin.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class PromoteToAdminUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(dto: PromoteToAdminDto): Promise<{ message: string }> {
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
      throw new ForbiddenError('Only the group owner can promote a member to admin.');
    }

    const target = await this.chatRepository.findParticipantByUser(dto.chatId, dto.targetUserId);

    if (!target || target.leftAt) {
      throw new NotFoundError('Participant not found in this group.');
    }

    if (target.role !== 'MEMBER') {
      throw new BadRequestError('Only a member can be promoted to admin.');
    }

    await this.chatRepository.updateParticipantRole(dto.chatId, dto.targetUserId, 'ADMIN');

    return { message: 'Member promoted to admin successfully.' };
  }
}
