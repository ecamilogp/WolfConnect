import { ChatSummaryDto } from '../../../domain/dto/chat/chat-summary.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';

export class GetChatsUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(userId: string): Promise<ChatSummaryDto[]> {
    return this.chatRepository.findAllByUser(userId);
  }
}
