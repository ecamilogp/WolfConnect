import { Chat } from '../../../domain/entities/chat.entity.js';
import { UpdateGroupDto } from '../../../domain/dto/chat/update-group.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import {
  requireActiveGroup,
  requireActiveParticipant,
  requireOwnerOrAdmin,
} from './group-admin.guards.js';

export class UpdateGroupUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(dto: UpdateGroupDto): Promise<Chat> {
    const chat = await requireActiveGroup(this.chatRepository, dto.chatId);

    if (chat.type !== 'GROUP') {
      throw new BadRequestError('Cannot update a private chat.');
    }

    const participant = await requireActiveParticipant(
      this.chatRepository,
      dto.chatId,
      dto.requesterUserId,
    );

    requireOwnerOrAdmin(participant, 'Only the group owner or an admin can update the group.');

    return this.chatRepository.updateGroup(dto);
  }
}
