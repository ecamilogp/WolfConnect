export interface CreatePlatformInvitationDto {
  email: string;
  token: string;
  invitedByUserId: string;
  expiresAt: Date;
}
