import { UpdateMessageDto } from '../../../domain/dto/message/update-message.dto.js';
import { UpdateMessageResponseDto } from '../../../domain/dto/message/update-message-response.dto.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { requireActiveMessage } from './message.guards.js';

export class EditMessageUseCase {
  constructor(private readonly messageRepository: MessageRepository) {}

  async execute(dto: UpdateMessageDto): Promise<UpdateMessageResponseDto> {
    const message = await requireActiveMessage(this.messageRepository, dto.messageId);

    if (message.senderId !== dto.userId) {
      throw new ForbiddenError('You can only edit your own messages.');
    }

    return this.messageRepository.update(dto);
  }
}
