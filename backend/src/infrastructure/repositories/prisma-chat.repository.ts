import { ChatRepository } from '../../domain/repositories/chat.repository.js';
import { Chat } from '../../domain/entities/chat.entity.js';
import { prisma } from '../database/prisma.service.js';
import { ChatMapper } from '../mappers/chat.mapper.js';
import { CreateGroupChatDto } from '../../domain/dto/chat/create-group-chat.dto.js';

export class PrismaChatRepository implements ChatRepository {
  async findPrivateChatBetweenUsers(
    currentUserId: string,
    targetUserId: string,
  ): Promise<Chat | null> {
    const chat = await prisma.chat.findFirst({
      where: {
        type: 'PRIVATE',
        participants: {
          every: {
            leftAt: null,
          },
        },
        AND: [
          {
            participants: {
              some: {
                userId: currentUserId,
                leftAt: null,
              },
            },
          },
          {
            participants: {
              some: {
                userId: targetUserId,
                leftAt: null,
              },
            },
          },
        ],
      },
    });

    if (!chat) {
      return null;
    }

    return ChatMapper.toDomain(chat);
  }

  async createPrivateChat(currentUserId: string, targetUserId: string): Promise<Chat> {
    const prismaChat = await prisma.$transaction(async (tx) => {
      const chat = await tx.chat.create({
        data: {
          type: 'PRIVATE',
          participants: {
            create: [
              {
                userId: currentUserId,
              },
              {
                userId: targetUserId,
              },
            ],
          },
        },
      });

      return chat;
    });

    return ChatMapper.toDomain(prismaChat);
  }

  async createGroupChat(dto: CreateGroupChatDto): Promise<Chat> {
    const prismaChat = await prisma.$transaction(async (tx) => {
      const chat = await tx.chat.create({
        data: {
          type: 'GROUP',
          name: dto.name,
          description: dto.description,
          imageUrl: dto.imageUrl,
          joinPolicy: dto.joinPolicy,
          participants: {
            create: {
              userId: dto.creatorUserId,
              role: 'OWNER',
            },
          },
        },
      });

      return chat;
    });

    return ChatMapper.toDomain(prismaChat);
  }
}
