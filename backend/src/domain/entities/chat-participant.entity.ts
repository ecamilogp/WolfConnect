export interface ChatParticipant {
  id: string;
  chatId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
  leftAt: Date | null;
}
