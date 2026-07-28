import { ChatRepository } from '../../domain/repositories/chat.repository.js';
import { Chat } from '../../domain/entities/chat.entity.js';
import { prisma } from '../database/prisma.service.js';
import { ChatMapper } from '../mappers/chat.mapper.js';
import { CreateGroupChatDto } from '../../domain/dto/chat/create-group-chat.dto.js';
import { ChatParticipant } from '../../domain/entities/chat-participant.entity.js';
import { AcceptGroupInvitationDto } from '../../domain/dto/group-invitations/accept-group-invitation.dto.js';

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

  async findById(chatId: string): Promise<Chat | null> {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
    });

    if (!chat) {
      return null;
    }

    return ChatMapper.toDomain(chat);
  }

  async findParticipantByUser(chatId: string, userId: string): Promise<ChatParticipant | null> {
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId,
      },
    });

    if (!participant) {
      return null;
    }

    return {
      id: participant.id,
      chatId: participant.chatId,
      userId: participant.userId,
      role: participant.role,
      joinedAt: participant.joinedAt,
      leftAt: participant.leftAt,
    };
  }

  async addParticipant(chatId: string, userId: string): Promise<void> {
    await prisma.chatParticipant.create({
      data: {
        chatId,
        userId,
        role: 'MEMBER',
      },
    });
  }

  async acceptGroupInvitation(dto: AcceptGroupInvitationDto): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.chatParticipant.create({
        data: {
          chatId: dto.chatId,
          userId: dto.userId,
          role: 'MEMBER',
        },
      });

      await tx.groupInvitation.update({
        where: {
          id: dto.invitationId,
        },
        data: {
          status: 'ACCEPTED',
          respondedAt: new Date(),
        },
      });
    });
  }

  async leaveGroup(chatId: string, userId: string): Promise<void> {
    await prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
      data: {
        leftAt: new Date(),
      },
    });
  }

  async deleteGroup(chatId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.chat.update({
        where: {
          id: chatId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      await tx.chatParticipant.updateMany({
        where: {
          chatId,
          leftAt: null,
        },
        data: {
          leftAt: new Date(),
        },
      });

      await tx.groupInvitation.updateMany({
        where: {
          chatId,
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
        },
      });
    });
  }
}
