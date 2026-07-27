export interface GroupInvitation {
  id: string;
  chatId: string;
  invitedByUserId: string;
  invitedUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: Date;
  respondedAt: Date | null;
}
