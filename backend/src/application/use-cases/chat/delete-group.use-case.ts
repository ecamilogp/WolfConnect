import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class DeleteGroupUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(chatId: string, currentUserId: string): Promise<{ message: string }> {
    const chat = await this.chatRepository.findById(chatId);

    if (!chat) {
      throw new NotFoundError('Chat not found.');
    }

    if (chat.type !== 'GROUP') {
      throw new BadRequestError('Cannot delete a private chat.');
    }

    const participant = await this.chatRepository.findParticipantByUser(chatId, currentUserId);

    if (!participant) {
      throw new ForbiddenError('You are not a participant of this group.');
    }

    if (participant.role !== 'OWNER') {
      throw new ForbiddenError('Only the group owner can delete the group.');
    }

    await this.chatRepository.deleteGroup(chatId);

    return {
      message: 'Group deleted successfully.',
    };
  }
}
