import { InvitationStatus } from '@prisma/client';

export interface GroupInvitation {
  id: string;
  chatId: string;
  invitedByUserId: string;
  invitedUserId: string;
  status: InvitationStatus;
  createdAt: Date;
  respondedAt: Date | null;
}
