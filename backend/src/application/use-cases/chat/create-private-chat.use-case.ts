import { Chat } from '../../../domain/entities/chat.entity.js';
import { CreatePrivateChatDto } from '../../../domain/dto/chat/create-private-chat.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';

export class CreatePrivateChatUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(dto: CreatePrivateChatDto): Promise<Chat> {
    const { currentUserId, targetUserId } = dto;

    if (currentUserId === targetUserId) {
      throw new BadRequestError('You cannot create a chat with yourself.');
    }

    const existingChat = await this.chatRepository.findPrivateChatBetweenUsers(
      currentUserId,
      targetUserId,
    );

    if (existingChat) {
      return existingChat;
    }

    return this.chatRepository.createPrivateChat(currentUserId, targetUserId);
  }
}
