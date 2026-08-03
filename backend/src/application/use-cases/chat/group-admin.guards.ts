import { Chat } from '../../../domain/entities/chat.entity.js';
import { ChatParticipant } from '../../../domain/entities/chat-participant.entity.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export async function requireActiveGroup(
  chatRepository: ChatRepository,
  chatId: string,
): Promise<Chat> {
  const chat = await chatRepository.findById(chatId);

  if (!chat || chat.deletedAt) {
    throw new NotFoundError('Group not found.');
  }

  return chat;
}

export async function requireActiveParticipant(
  chatRepository: ChatRepository,
  chatId: string,
  userId: string,
  message = 'You are not a participant of this group.',
): Promise<ChatParticipant> {
  const participant = await chatRepository.findParticipantByUser(chatId, userId);

  if (!participant || participant.leftAt) {
    throw new ForbiddenError(message);
  }

  return participant;
}

export async function requireActiveTargetParticipant(
  chatRepository: ChatRepository,
  chatId: string,
  targetUserId: string,
): Promise<ChatParticipant> {
  const target = await chatRepository.findParticipantByUser(chatId, targetUserId);

  if (!target || target.leftAt) {
    throw new NotFoundError('Participant not found in this group.');
  }

  return target;
}

export async function requireGroupOwner(
  chatRepository: ChatRepository,
  chatId: string,
  requesterUserId: string,
  message: string,
): Promise<ChatParticipant> {
  const requester = await chatRepository.findParticipantByUser(chatId, requesterUserId);

  if (!requester || requester.leftAt || requester.role !== 'OWNER') {
    throw new ForbiddenError(message);
  }

  return requester;
}

export function requireOwnerOrAdmin(participant: ChatParticipant, message: string): void {
  if (participant.role !== 'OWNER' && participant.role !== 'ADMIN') {
    throw new ForbiddenError(message);
  }
}
