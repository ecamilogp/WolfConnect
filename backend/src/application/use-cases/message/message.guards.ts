import { Chat } from '../../../domain/entities/chat.entity.js';
import { ChatParticipant } from '../../../domain/entities/chat-participant.entity.js';
import { MessageResponseDto } from '../../../domain/dto/message/message-response.dto.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export async function requireActiveChat(chatRepository: ChatRepository, chatId: string): Promise<Chat> {
  const chat = await chatRepository.findById(chatId);

  if (!chat || chat.deletedAt) {
    throw new NotFoundError('Chat not found.');
  }

  return chat;
}

export async function requireActiveMessage(
  messageRepository: MessageRepository,
  messageId: string,
): Promise<MessageResponseDto> {
  const message = await messageRepository.findById(messageId);

  if (!message || message.deletedAt) {
    throw new NotFoundError('Message not found.');
  }

  return message;
}

export interface RequireChatParticipantOptions {
  checkLeft?: boolean;
  message?: string;
}

export async function requireChatParticipant(
  chatRepository: ChatRepository,
  chatId: string,
  userId: string,
  options: RequireChatParticipantOptions = {},
): Promise<ChatParticipant> {
  const { checkLeft = true, message = 'You are not a participant of this chat.' } = options;
  const participant = await chatRepository.findParticipantByUser(chatId, userId);

  if (!participant || (checkLeft && participant.leftAt)) {
    throw new ForbiddenError(message);
  }

  return participant;
}
