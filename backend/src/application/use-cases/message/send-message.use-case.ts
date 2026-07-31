import { CreateMessageDto } from '../../../domain/dto/message/create-message.dto.js';
import { MessageResponseDto } from '../../../domain/dto/message/message-response.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';
import { requireActiveChat, requireChatParticipant } from './message.guards.js';

export class SendMessageUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
  ) {}

  async execute(data: CreateMessageDto): Promise<MessageResponseDto> {
    await requireActiveChat(this.chatRepository, data.chatId);

    await requireChatParticipant(this.chatRepository, data.chatId, data.senderId, {
      checkLeft: false,
    });

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
