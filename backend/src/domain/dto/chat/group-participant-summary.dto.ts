import { ParticipantRole } from '@prisma/client';

export interface GroupParticipantSummaryDto {
  userId: string;
  role: ParticipantRole;
  joinedAt: Date;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: string | null;
}
