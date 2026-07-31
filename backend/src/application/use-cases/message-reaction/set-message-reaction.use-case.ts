import { MessageReactionUpdateResultDto } from '../../../domain/dto/message-reaction/message-reaction-update-result.dto.js';
import { SetMessageReactionDto } from '../../../domain/dto/message-reaction/set-message-reaction.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { MessageReactionRepository } from '../../../domain/repositories/message-reaction.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class SetMessageReactionUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatRepository: ChatRepository,
    private readonly messageReactionRepository: MessageReactionRepository,
  ) {}

  async execute(dto: SetMessageReactionDto): Promise<MessageReactionUpdateResultDto> {
    const message = await this.messageRepository.findById(dto.messageId);

    if (!message || message.deletedAt) {
      throw new NotFoundError('Message not found.');
    }

    const participant = await this.chatRepository.findParticipantByUser(message.chatId, dto.userId);

    if (!participant || participant.leftAt) {
      throw new ForbiddenError('You are not a participant of this chat.');
    }

    const reaction = await this.messageReactionRepository.upsert(dto);

    const updatedMessage = await this.messageRepository.findById(dto.messageId);

    return {
      chatId: message.chatId,
      messageId: message.id,
      reactions: updatedMessage?.reactions ?? [],
      reaction,
    };
  }
}
