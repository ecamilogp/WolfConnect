import { TransferOwnershipDto } from '../../../domain/dto/chat/transfer-ownership.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import {
  requireActiveGroup,
  requireActiveTargetParticipant,
  requireGroupOwner,
} from './group-admin.guards.js';

export class TransferOwnershipUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(dto: TransferOwnershipDto): Promise<{ message: string }> {
    await requireActiveGroup(this.chatRepository, dto.chatId);

    if (dto.requesterUserId === dto.targetUserId) {
      throw new BadRequestError('You are already the group owner.');
    }

    await requireGroupOwner(
      this.chatRepository,
      dto.chatId,
      dto.requesterUserId,
      'Only the group owner can transfer ownership.',
    );

    await requireActiveTargetParticipant(this.chatRepository, dto.chatId, dto.targetUserId);

    await this.chatRepository.transferOwnership(dto.chatId, dto.requesterUserId, dto.targetUserId);

    return { message: 'Group ownership transferred successfully.' };
  }
}
