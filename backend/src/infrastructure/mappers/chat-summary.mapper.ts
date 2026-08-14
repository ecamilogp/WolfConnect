import { Prisma } from '@prisma/client';
import { ChatSummaryDto } from '../../domain/dto/chat/chat-summary.dto.js';

type ChatWithParticipants = Prisma.ChatGetPayload<{
  include: {
    participants: {
      include: {
        user: {
          select: {
            id: true;
            firstName: true;
            lastName: true;
            profileImage: true;
          };
        };
      };
    };
  };
}>;

export class ChatSummaryMapper {
  static toDto(
    chat: ChatWithParticipants,
    currentUserId: string,
    unreadCount: number,
  ): ChatSummaryDto {
    if (chat.type === 'GROUP') {
      return {
        id: chat.id,
        type: chat.type,
        name: chat.name ?? '',
        imageUrl: chat.imageUrl,
        unreadCount,
        otherUserId: null,
      };
    }

    const otherParticipant = chat.participants.find(
      (participant) => participant.user.id !== currentUserId,
    );

    return {
      id: chat.id,
      type: chat.type,
      name: otherParticipant
        ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
        : '',
      imageUrl: otherParticipant?.user.profileImage ?? null,
      unreadCount,
      otherUserId: otherParticipant?.user.id ?? null,
    };
  }
}
