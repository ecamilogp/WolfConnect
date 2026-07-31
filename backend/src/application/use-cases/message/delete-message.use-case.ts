import { DeleteMessageDto } from '../../../domain/dto/message/delete-message.dto.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { requireActiveMessage } from './message.guards.js';

export class DeleteMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(dto: DeleteMessageDto): Promise<{ chatId: string }> {
    const message = await requireActiveMessage(this.messageRepository, dto.messageId);

    if (message.senderId !== dto.userId) {
      throw new ForbiddenError('You can only delete your own messages.');
    }

    await this.messageRepository.delete(dto);

    return { chatId: message.chatId };
  }
}
