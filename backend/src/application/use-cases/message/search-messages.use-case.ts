import { MessageListItemDto } from '../../../domain/dto/message/message-list-item.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { requireActiveChat, requireChatParticipant } from './message.guards.js';

export class SearchMessagesUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(chatId: string, userId: string, query: string): Promise<MessageListItemDto[]> {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length === 0) {
      throw new BadRequestError('Search query cannot be empty.');
    }

    await requireActiveChat(this.chatRepository, chatId);
    await requireChatParticipant(this.chatRepository, chatId, userId);

    return this.messageRepository.searchMessages(chatId, trimmedQuery);
  }
}
