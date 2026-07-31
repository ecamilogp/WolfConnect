import { RemoveMessageReactionDto } from '../../../domain/dto/message-reaction/remove-message-reaction.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { MessageReactionRepository } from '../../../domain/repositories/message-reaction.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class RemoveMessageReactionUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatRepository: ChatRepository,
    private readonly messageReactionRepository: MessageReactionRepository,
  ) {}

  async execute(dto: RemoveMessageReactionDto): Promise<void> {
    const message = await this.messageRepository.findById(dto.messageId);

    if (!message || message.deletedAt) {
      throw new NotFoundError('Message not found.');
    }

    const participant = await this.chatRepository.findParticipantByUser(message.chatId, dto.userId);

    if (!participant || participant.leftAt) {
      throw new ForbiddenError('You are not a participant of this chat.');
    }

    await this.messageReactionRepository.remove(dto);
  }
}
