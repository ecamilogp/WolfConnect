import { GroupDetailDto } from '../../../domain/dto/chat/group-detail.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { requireActiveGroup, requireActiveParticipant } from './group-admin.guards.js';

export class GetGroupDetailUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(chatId: string, requesterUserId: string): Promise<GroupDetailDto> {
    const chat = await requireActiveGroup(this.chatRepository, chatId);

    if (chat.type !== 'GROUP') {
      throw new BadRequestError('Chat is not a group.');
    }

    await requireActiveParticipant(this.chatRepository, chatId, requesterUserId);

    const participants = await this.chatRepository.findParticipants(chatId);

    return {
      id: chat.id,
      type: chat.type,
      name: chat.name,
      description: chat.description,
      imageUrl: chat.imageUrl,
      joinPolicy: chat.joinPolicy,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      participants,
    };
  }
}
