import { PlatformInvitation } from '../entities/platform-invitation.entity.js';
import { CreatePlatformInvitationDto } from '../dto/platform-invitation/create-platform-invitation.dto.js';
import { PlatformInvitationResponseDto } from '../dto/platform-invitation/platform-invitation-response.dto.js';

export interface PlatformInvitationRepository {
  create(data: CreatePlatformInvitationDto): Promise<PlatformInvitationResponseDto>;

  findByToken(token: string): Promise<PlatformInvitation | null>;

  findLatestPendingByEmail(email: string): Promise<PlatformInvitation | null>;

  renew(id: string, data: { token: string; expiresAt: Date }): Promise<PlatformInvitationResponseDto>;

  markAsAccepted(id: string): Promise<void>;
}
