export interface PlatformInvitationResponseDto {
  id: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  invitedByUserId: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}
