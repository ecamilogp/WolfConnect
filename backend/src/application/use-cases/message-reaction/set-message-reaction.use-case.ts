import { MessageReactionUpdateResultDto } from '../../../domain/dto/message-reaction/message-reaction-update-result.dto.js';
import { SetMessageReactionDto } from '../../../domain/dto/message-reaction/set-message-reaction.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { MessageReactionRepository } from '../../../domain/repositories/message-reaction.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { requireActiveMessage, requireChatParticipant } from '../message/message.guards.js';

export class SetMessageReactionUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatRepository: ChatRepository,
    private readonly messageReactionRepository: MessageReactionRepository,
  ) {}

  async execute(dto: SetMessageReactionDto): Promise<MessageReactionUpdateResultDto> {
    const message = await requireActiveMessage(this.messageRepository, dto.messageId);

    await requireChatParticipant(this.chatRepository, message.chatId, dto.userId);

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
