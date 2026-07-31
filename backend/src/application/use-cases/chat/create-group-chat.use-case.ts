import { Chat } from '../../../domain/entities/chat.entity.js';
import { CreateGroupChatDto } from '../../../domain/dto/chat/create-group-chat.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';

export class CreateGroupChatUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(dto: CreateGroupChatDto): Promise<Chat> {
    return this.chatRepository.createGroupChat(dto);
  }
}
