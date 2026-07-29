import { Prisma } from '@prisma/client';

import { CreateMessageDto } from '../../domain/dto/message/create-message.dto.js';
import { MessageResponseDto } from '../../domain/dto/message/message-response.dto.js';
import { MessageRepository } from '../../domain/repositories/message.repository.js';
import { prisma } from '../database/prisma.service.js';
import { MessageListItemDto } from '../../domain/dto/message/message-list-item.dto.js';
import { UpdateMessageResponseDto } from '../../domain/dto/message/update-message-response.dto.js';
import { UpdateMessageDto } from '../../domain/dto/message/update-message.dto.js';

export class PrismaMessageRepository implements MessageRepository {
  async create(data: CreateMessageDto): Promise<MessageResponseDto> {
    const message = await prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          chatId: data.chatId,
          senderId: data.senderId,
          content: data.content,
        },
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

    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
    };
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
    });

    return messages.map((message) => ({
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
    }));
  }

  async findById(messageId: string): Promise<MessageResponseDto | null> {
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return null;
    }

    return {
      id: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
    };
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
}
