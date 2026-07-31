import { TransferOwnershipDto } from '../../../domain/dto/chat/transfer-ownership.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class TransferOwnershipUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(dto: TransferOwnershipDto): Promise<{ message: string }> {
    const chat = await this.chatRepository.findById(dto.chatId);

    if (!chat || chat.deletedAt) {
      throw new NotFoundError('Group not found.');
    }

    if (dto.requesterUserId === dto.targetUserId) {
      throw new BadRequestError('You are already the group owner.');
    }

    const requester = await this.chatRepository.findParticipantByUser(
      dto.chatId,
      dto.requesterUserId,
    );

    if (!requester || requester.leftAt || requester.role !== 'OWNER') {
      throw new ForbiddenError('Only the group owner can transfer ownership.');
    }

    const target = await this.chatRepository.findParticipantByUser(dto.chatId, dto.targetUserId);

    if (!target || target.leftAt) {
      throw new NotFoundError('Participant not found in this group.');
    }

    await this.chatRepository.transferOwnership(dto.chatId, dto.requesterUserId, dto.targetUserId);

    return { message: 'Group ownership transferred successfully.' };
  }
}
