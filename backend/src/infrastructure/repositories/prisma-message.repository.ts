import { CreateMessageDto } from '../../domain/dto/message/create-message.dto.js';
import { MessageResponseDto } from '../../domain/dto/message/message-response.dto.js';
import { MessageRepository } from '../../domain/repositories/message.repository.js';
import { prisma } from '../database/prisma.service.js';
import { MessageListItemDto } from '../../domain/dto/message/message-list-item.dto.js';
import { UpdateMessageResponseDto } from '../../domain/dto/message/update-message-response.dto.js';
import { UpdateMessageDto } from '../../domain/dto/message/update-message.dto.js';
import { DeleteMessageDto } from '../../domain/dto/message/delete-message.dto.js';
import { MarkMessagesAsReadDto } from '../../domain/dto/message/mark-messages-as-read.dto.js';
import { MessageMapper } from '../mappers/message.mapper.js';

const MESSAGE_RELATIONS_INCLUDE = {
  sender: true,
  replyTo: true,
  reactions: true,
} as const;

export class PrismaMessageRepository implements MessageRepository {
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

    return MessageMapper.toResponseDto(message);
  }

  async findByChatId(chatId: string): Promise<MessageListItemDto[]> {
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: MESSAGE_RELATIONS_INCLUDE,
    });

    return messages.map((message) => MessageMapper.toListItemDto(message));
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

    return MessageMapper.toResponseDto(message);
  }

  async update(dto: UpdateMessageDto): Promise<UpdateMessageResponseDto> {
    const message = await prisma.message.update({
      where: {
        id: dto.messageId,
      },
      data: {
        content: dto.content,
        editedAt: new Date(),
      },
    });

    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
    };
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

  async markAsRead(dto: MarkMessagesAsReadDto): Promise<void> {
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
      return;
    }

    await prisma.messageRead.createMany({
      data: unreadMessages.map((message) => ({
        messageId: message.id,
        userId: dto.userId,
      })),
    });
  }
}
