import { GroupJoinPolicy } from '../../entities/chat.entity.js';

export interface CreateGroupChatDto {
  creatorUserId: string;

  name: string;

  description?: string;

  imageUrl?: string;

  joinPolicy: GroupJoinPolicy;
}
