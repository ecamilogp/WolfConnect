import { CreateMessageDto } from '../../domain/dto/message/create-message.dto.js';
import { MessageResponseDto } from '../../domain/dto/message/message-response.dto.js';
import { MessageRepository } from '../../domain/repositories/message.repository.js';
import { prisma } from '../database/prisma.service.js';
import { MessageListItemDto } from '../../domain/dto/message/message-list-item.dto.js';
import { UpdateMessageDto } from '../../domain/dto/message/update-message.dto.js';
import { DeleteMessageDto } from '../../domain/dto/message/delete-message.dto.js';
import { MarkMessagesAsReadDto } from '../../domain/dto/message/mark-messages-as-read.dto.js';
import { MessageMapper } from '../mappers/message.mapper.js';

const MESSAGE_RELATIONS_INCLUDE = {
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
} as const;

export class PrismaMessageRepository implements MessageRepository {
  private async getActiveParticipantIds(chatId: string): Promise<string[]> {
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

  async create(data: CreateMessageDto): Promise<MessageResponseDto> {
    const message = await prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          chatId: data.chatId,
          senderId: data.senderId,
          content: data.content,
          replyToMessageId: data.replyToMessageId,
        },
        include: MESSAGE_RELATIONS_INCLUDE,
      });

      await tx.chat.update({
        where: {
          id: data.chatId,
        },
        data: {
          lastMessageAt: createdMessage.createdAt,
        },
      });

      return createdMessage;
    });

    const activeParticipantIds = await this.getActiveParticipantIds(data.chatId);

    return MessageMapper.toResponseDto(message, activeParticipantIds);
  }

  async findByChatId(chatId: string): Promise<MessageListItemDto[]> {
    const [messages, activeParticipantIds] = await Promise.all([
      prisma.message.findMany({
        where: {
          chatId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: MESSAGE_RELATIONS_INCLUDE,
      }),
      this.getActiveParticipantIds(chatId),
    ]);

    return messages.map((message) => MessageMapper.toListItemDto(message, activeParticipantIds));
  }

  async findById(messageId: string): Promise<MessageResponseDto | null> {
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
      include: MESSAGE_RELATIONS_INCLUDE,
    });

    if (!message) {
      return null;
    }

    const activeParticipantIds = await this.getActiveParticipantIds(message.chatId);

    return MessageMapper.toResponseDto(message, activeParticipantIds);
  }

  async update(dto: UpdateMessageDto): Promise<MessageResponseDto> {
    const message = await prisma.message.update({
      where: {
        id: dto.messageId,
      },
      data: {
        content: dto.content,
        editedAt: new Date(),
      },
      include: MESSAGE_RELATIONS_INCLUDE,
    });

    const activeParticipantIds = await this.getActiveParticipantIds(message.chatId);

    return MessageMapper.toResponseDto(message, activeParticipantIds);
  }

  async delete(dto: DeleteMessageDto): Promise<void> {
    await prisma.message.update({
      where: {
        id: dto.messageId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async markAsRead(dto: MarkMessagesAsReadDto): Promise<string[]> {
    const unreadMessages = await prisma.message.findMany({
      where: {
        chatId: dto.chatId,
        senderId: {
          not: dto.userId,
        },
        deletedAt: null,
        reads: {
          none: {
            userId: dto.userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (unreadMessages.length === 0) {
      return [];
    }

    await prisma.messageRead.createMany({
      data: unreadMessages.map((message) => ({
        messageId: message.id,
        userId: dto.userId,
      })),
      skipDuplicates: true,
    });

    const activeParticipantIds = await this.getActiveParticipantIds(dto.chatId);

    const messagesWithReads = await prisma.message.findMany({
      where: {
        id: { in: unreadMessages.map((message) => message.id) },
      },
      select: {
        id: true,
        senderId: true,
        reads: {
          select: {
            userId: true,
          },
        },
      },
    });

    return messagesWithReads
      .filter((message) => {
        const requiredReaderIds = activeParticipantIds.filter((id) => id !== message.senderId);
        const readerIds = new Set(message.reads.map((read) => read.userId));

        return requiredReaderIds.every((id) => readerIds.has(id));
      })
      .map((message) => message.id);
  }
}
