import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { ConflictError } from '../../../shared/errors/conflict-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class LeaveGroupUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(chatId: string, currentUserId: string): Promise<{ message: string }> {
    const chat = await this.chatRepository.findById(chatId);

    if (!chat) {
      throw new NotFoundError('Chat not found.');
    }

    if (chat.type !== 'GROUP') {
      throw new BadRequestError('Cannot leave a private chat.');
    }

    const participant = await this.chatRepository.findParticipantByUser(chatId, currentUserId);

    if (!participant) {
      throw new ForbiddenError('You are not a participant of this group.');
    }

    if (participant.leftAt) {
      throw new ConflictError('You have already left this group.');
    }

    if (participant.role === 'OWNER') {
      throw new ConflictError(
        'The group owner cannot leave the group. Transfer ownership or delete the group first.',
      );
    }

    await this.chatRepository.leaveGroup(chatId, currentUserId);

    return {
      message: 'You have left the group successfully.',
    };
  }
}
