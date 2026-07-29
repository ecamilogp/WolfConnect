import { MessageListItemDto } from '../../../domain/dto/message/message-list-item.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class GetMessagesUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(chatId: string, userId: string): Promise<MessageListItemDto[]> {
    const chat = await this.chatRepository.findById(chatId);

    if (!chat || chat.deletedAt) {
      throw new NotFoundError('Chat not found.');
    }

    const participant = await this.chatRepository.findParticipantByUser(chatId, userId);

    if (!participant || participant.leftAt) {
      throw new ForbiddenError('You are not a participant of this chat.');
    }

    return this.messageRepository.findByChatId(chatId);
  }
}
