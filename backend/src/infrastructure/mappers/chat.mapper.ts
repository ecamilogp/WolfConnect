import type { Chat as PrismaChat } from '@prisma/client';
import { Chat } from '../../domain/entities/chat.entity.js';

export class ChatMapper {
  static toDomain(prismaChat: PrismaChat): Chat {
    return new Chat({
      id: prismaChat.id,
      type: prismaChat.type,
      name: prismaChat.name,
      description: prismaChat.description,
      imageUrl: prismaChat.imageUrl,
      joinPolicy: prismaChat.joinPolicy,
      lastMessageAt: prismaChat.lastMessageAt,
      createdAt: prismaChat.createdAt,
      updatedAt: prismaChat.updatedAt,
      deletedAt: prismaChat.deletedAt,
    });
  }
}
