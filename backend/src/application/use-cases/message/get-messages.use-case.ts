import { MessageListItemDto } from '../../../domain/dto/message/message-list-item.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { requireActiveChat, requireChatParticipant } from './message.guards.js';

export class GetMessagesUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(chatId: string, userId: string): Promise<MessageListItemDto[]> {
    await requireActiveChat(this.chatRepository, chatId);

    await requireChatParticipant(this.chatRepository, chatId, userId);

    return this.messageRepository.findByChatId(chatId);
  }
}
