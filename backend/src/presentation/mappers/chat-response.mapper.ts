import { Chat } from '../../domain/entities/chat.entity.js';
import { ChatResponse } from '../responses/chat.response.js';

export class ChatResponseMapper {
  static toResponse(chat: Chat): ChatResponse {
    return {
      id: chat.id,
      type: chat.type,
      name: chat.name,
      description: chat.description,
      imageUrl: chat.imageUrl,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }
}
