import { ParticipantRole } from '@prisma/client';

export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt: Date;
  leftAt: Date | null;
}
