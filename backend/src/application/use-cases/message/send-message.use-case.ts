import { CreateMessageDto } from '../../../domain/dto/message/create-message.dto.js';
import { MessageResponseDto } from '../../../domain/dto/message/message-response.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class SendMessageUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(data: CreateMessageDto): Promise<MessageResponseDto> {
    const chat = await this.chatRepository.findById(data.chatId);

    if (!chat || chat.deletedAt) {
      throw new NotFoundError('Chat not found.');
    }

    const participant = await this.chatRepository.findParticipantByUser(data.chatId, data.senderId);

    if (!participant) {
      throw new ForbiddenError('You are not a participant of this chat.');
    }

    return this.messageRepository.create(data);
  }
}
