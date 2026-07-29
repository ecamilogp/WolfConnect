import { MarkMessagesAsReadDto } from '../../../domain/dto/message/mark-messages-as-read.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class MarkMessagesAsReadUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(dto: MarkMessagesAsReadDto): Promise<void> {
    const chat = await this.chatRepository.findById(dto.chatId);

    if (!chat || chat.deletedAt) {
      throw new NotFoundError('Chat not found.');
    }

    const participant = await this.chatRepository.findParticipantByUser(dto.chatId, dto.userId);

    if (!participant || participant.leftAt) {
      throw new ForbiddenError('You are not a participant in this chat.');
    }

    await this.messageRepository.markAsRead(dto);
  }
}
