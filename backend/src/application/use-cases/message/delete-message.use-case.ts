import { DeleteMessageDto } from '../../../domain/dto/message/delete-message.dto.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class DeleteMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(dto: DeleteMessageDto): Promise<void> {
    const message = await this.messageRepository.findById(dto.messageId);

    if (!message || message.deletedAt) {
      throw new NotFoundError('Message not found.');
    }

    if (message.senderId !== dto.userId) {
      throw new ForbiddenError('You can only delete your own messages.');
    }

    await this.messageRepository.delete(dto);
  }
}
