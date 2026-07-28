import type { Chat as PrismaChat } from '@prisma/client';
import { Chat } from '../../domain/entities/chat.entity.js';

export class ChatMapper {
  static toDomain(prismaChat: PrismaChat): Chat {
    return new Chat(
      prismaChat.id,
      prismaChat.type,
      prismaChat.name,
      prismaChat.description,
      prismaChat.imageUrl,
      prismaChat.joinPolicy,
      prismaChat.lastMessageAt,
      prismaChat.createdAt,
      prismaChat.updatedAt,
      prismaChat.deletedAt,
    );
  }
}
