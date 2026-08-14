import { Prisma, SystemEventType } from '@prisma/client';

import { ChatRepository } from '../../domain/repositories/chat.repository.js';
import { Chat } from '../../domain/entities/chat.entity.js';
import { prisma } from '../database/prisma.service.js';
import { ChatMapper } from '../mappers/chat.mapper.js';
import { CreateGroupChatDto } from '../../domain/dto/chat/create-group-chat.dto.js';
import { UpdateGroupDto } from '../../domain/dto/chat/update-group.dto.js';
import { ChatParticipant } from '../../domain/entities/chat-participant.entity.js';
import { AcceptGroupInvitationDto } from '../../domain/dto/chat-group-invitations/accept-group-invitation.dto.js';
import { ChatSummaryDto } from '../../domain/dto/chat/chat-summary.dto.js';
import { GroupParticipantSummaryDto } from '../../domain/dto/chat/group-participant-summary.dto.js';
import { MessageResponseDto } from '../../domain/dto/message/message-response.dto.js';
import { ChatSummaryMapper } from '../mappers/chat-summary.mapper.js';
import { MessageMapper } from '../mappers/message.mapper.js';

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
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
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

  async findParticipantIds(chatId: string): Promise<string[]> {
    const participants = await prisma.chatParticipant.findMany({
      where: {
        chatId,
        leftAt: null,
      },
      select: {
        userId: true,
      },
    });

    return participants.map((participant) => participant.userId);
  }

  async findParticipants(chatId: string): Promise<GroupParticipantSummaryDto[]> {
    const participants = await prisma.chatParticipant.findMany({
      where: {
        chatId,
        leftAt: null,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return participants.map((participant) => ({
      userId: participant.userId,
      role: participant.role,
      joinedAt: participant.joinedAt,
      firstName: participant.user.firstName,
      lastName: participant.user.lastName,
      username: participant.user.username,
      profileImage: participant.user.profileImage,
    }));
  }

  async findParticipantSummary(
    chatId: string,
    userId: string,
  ): Promise<GroupParticipantSummaryDto | null> {
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            profileImage: true,
          },
        },
      },
    });

    if (!participant || participant.leftAt) {
      return null;
    }

    return {
      userId: participant.userId,
      role: participant.role,
      joinedAt: participant.joinedAt,
      firstName: participant.user.firstName,
      lastName: participant.user.lastName,
      username: participant.user.username,
      profileImage: participant.user.profileImage,
    };
  }

  async addParticipant(chatId: string, userId: string): Promise<MessageResponseDto> {
    return prisma.$transaction(async (tx) => {
      await tx.chatParticipant.upsert({
        where: {
          chatId_userId: {
            chatId,
            userId,
          },
        },
        create: {
          chatId,
          userId,
          role: 'MEMBER',
        },
        update: {
          role: 'MEMBER',
          joinedAt: new Date(),
          leftAt: null,
        },
      });

      return this.createGroupSystemMessage(tx, chatId, 'PARTICIPANT_JOINED', userId);
    });
  }

  async acceptGroupInvitation(dto: AcceptGroupInvitationDto): Promise<MessageResponseDto> {
    return prisma.$transaction(async (tx) => {
      await tx.chatParticipant.upsert({
        where: {
          chatId_userId: {
            chatId: dto.chatId,
            userId: dto.userId,
          },
        },
        create: {
          chatId: dto.chatId,
          userId: dto.userId,
          role: 'MEMBER',
        },
        update: {
          role: 'MEMBER',
          joinedAt: new Date(),
          leftAt: null,
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

      return this.createGroupSystemMessage(tx, dto.chatId, 'PARTICIPANT_JOINED', dto.userId);
    });
  }

  private async createGroupSystemMessage(
    tx: Prisma.TransactionClient,
    chatId: string,
    systemEventType: SystemEventType,
    targetUserId: string,
  ): Promise<MessageResponseDto> {
    const targetUser = await tx.user.findUnique({
      where: {
        id: targetUserId,
      },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    const targetName = targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : '';

    const message = await tx.message.create({
      data: {
        chatId,
        senderId: null,
        type: 'SYSTEM',
        systemEventType,
        systemEventPayload: {
          targetUserId,
          targetName,
        },
      },
      include: {
        sender: true,
        replyTo: {
          include: {
            sender: true,
          },
        },
        reactions: true,
        reads: {
          select: {
            userId: true,
          },
        },
        attachments: true,
      },
    });

    await tx.chat.update({
      where: {
        id: chatId,
      },
      data: {
        lastMessageAt: message.createdAt,
      },
    });

    return MessageMapper.toResponseDto(message, []);
  }

  async leaveGroup(chatId: string, userId: string): Promise<MessageResponseDto> {
    return prisma.$transaction(async (tx) => {
      await tx.chatParticipant.update({
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

      return this.createGroupSystemMessage(tx, chatId, 'PARTICIPANT_LEFT', userId);
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

  async findAllByUser(userId: string): Promise<ChatSummaryDto[]> {
    const chats = await prisma.chat.findMany({
      where: {
        deletedAt: null,
        participants: {
          some: {
            userId,
            leftAt: null,
          },
        },
      },

      include: {
        participants: {
          where: {
            leftAt: null,
          },

          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },

      orderBy: {
        lastMessageAt: 'desc',
      },
    });

    const unreadCounts = await prisma.message.groupBy({
      by: ['chatId'],
      where: {
        chatId: { in: chats.map((chat) => chat.id) },
        senderId: { not: userId },
        deletedAt: null,
        reads: {
          none: {
            userId,
          },
        },
      },
      _count: {
        id: true,
      },
    });

    const unreadCountByChatId = new Map(
      unreadCounts.map((row) => [row.chatId, row._count.id]),
    );

    return chats.map((chat) =>
      ChatSummaryMapper.toDto(chat, userId, unreadCountByChatId.get(chat.id) ?? 0),
    );
  }

  async updateGroup(dto: UpdateGroupDto): Promise<Chat> {
    const chat = await prisma.chat.update({
      where: {
        id: dto.chatId,
      },
      data: {
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
      },
    });

    return ChatMapper.toDomain(chat);
  }

  async updateParticipantRole(
    chatId: string,
    userId: string,
    role: ChatParticipant['role'],
  ): Promise<void> {
    await prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
      data: {
        role,
      },
    });
  }

  async removeParticipant(chatId: string, userId: string): Promise<MessageResponseDto> {
    return prisma.$transaction(async (tx) => {
      await tx.chatParticipant.update({
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

      return this.createGroupSystemMessage(tx, chatId, 'PARTICIPANT_REMOVED', userId);
    });
  }

  async transferOwnership(
    chatId: string,
    currentOwnerUserId: string,
    newOwnerUserId: string,
  ): Promise<void> {
    await prisma.$transaction([
      prisma.chatParticipant.update({
        where: {
          chatId_userId: {
            chatId,
            userId: currentOwnerUserId,
          },
        },
        data: {
          role: 'ADMIN',
        },
      }),
      prisma.chatParticipant.update({
        where: {
          chatId_userId: {
            chatId,
            userId: newOwnerUserId,
          },
        },
        data: {
          role: 'OWNER',
        },
      }),
    ]);
  }
}
