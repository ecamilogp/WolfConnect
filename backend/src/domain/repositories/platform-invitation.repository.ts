import { PlatformInvitation } from '../entities/platform-invitation.entity.js';
import { CreatePlatformInvitationDto } from '../dto/platform-invitation/create-platform-invitation.dto.js';
import { PlatformInvitationResponseDto } from '../dto/platform-invitation/platform-invitation-response.dto.js';

export interface PlatformInvitationRepository {
  create(data: CreatePlatformInvitationDto): Promise<PlatformInvitationResponseDto>;

  findByToken(token: string): Promise<PlatformInvitation | null>;

  markAsAccepted(id: string): Promise<void>;
}
