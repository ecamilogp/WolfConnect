import { CreateMessageDto } from '../../../domain/dto/message/create-message.dto.js';
import { MessageResponseDto } from '../../../domain/dto/message/message-response.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
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

    if (data.replyToMessageId) {
      const repliedMessage = await this.messageRepository.findById(data.replyToMessageId);

      if (!repliedMessage || repliedMessage.deletedAt) {
        throw new NotFoundError('Message to reply to not found.');
      }

      if (repliedMessage.chatId !== data.chatId) {
        throw new BadRequestError('You can only reply to messages from the same chat.');
      }
    }

    return this.messageRepository.create(data);
  }
}
