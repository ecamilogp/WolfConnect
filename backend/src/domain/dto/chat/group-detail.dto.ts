import { ChatType, GroupJoinPolicy } from '../../entities/chat.entity.js';
import { GroupParticipantSummaryDto } from './group-participant-summary.dto.js';

export interface GroupDetailDto {
  id: string;
  type: ChatType;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  joinPolicy: GroupJoinPolicy | null;
  createdAt: Date;
  updatedAt: Date;
  participants: GroupParticipantSummaryDto[];
}
