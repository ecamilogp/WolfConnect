import { MarkMessagesAsReadDto } from '../../../domain/dto/message/mark-messages-as-read.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { requireActiveChat, requireChatParticipant } from './message.guards.js';

export class MarkMessagesAsReadUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(dto: MarkMessagesAsReadDto): Promise<string[]> {
    await requireActiveChat(this.chatRepository, dto.chatId);

    await requireChatParticipant(this.chatRepository, dto.chatId, dto.userId, {
      message: 'You are not a participant in this chat.',
    });

    return this.messageRepository.markAsRead(dto);
  }
}
