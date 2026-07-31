import { Chat } from '../../../domain/entities/chat.entity.js';
import { UpdateGroupDto } from '../../../domain/dto/chat/update-group.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class UpdateGroupUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(dto: UpdateGroupDto): Promise<Chat> {
    const chat = await this.chatRepository.findById(dto.chatId);

    if (!chat || chat.deletedAt) {
      throw new NotFoundError('Group not found.');
    }

    if (chat.type !== 'GROUP') {
      throw new BadRequestError('Cannot update a private chat.');
    }

    const participant = await this.chatRepository.findParticipantByUser(
      dto.chatId,
      dto.requesterUserId,
    );

    if (!participant || participant.leftAt) {
      throw new ForbiddenError('You are not a participant of this group.');
    }

    if (participant.role !== 'OWNER' && participant.role !== 'ADMIN') {
      throw new ForbiddenError('Only the group owner or an admin can update the group.');
    }

    return this.chatRepository.updateGroup(dto);
  }
}
