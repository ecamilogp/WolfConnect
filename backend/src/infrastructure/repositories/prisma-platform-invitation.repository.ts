import { CreatePlatformInvitationDto } from '../../domain/dto/platform-invitation/create-platform-invitation.dto.js';
import { PlatformInvitationResponseDto } from '../../domain/dto/platform-invitation/platform-invitation-response.dto.js';
import { PlatformInvitation } from '../../domain/entities/platform-invitation.entity.js';
import { PlatformInvitationRepository } from '../../domain/repositories/platform-invitation.repository.js';
import { prisma } from '../database/prisma.service.js';

export class PrismaPlatformInvitationRepository implements PlatformInvitationRepository {
  async create(data: CreatePlatformInvitationDto): Promise<PlatformInvitationResponseDto> {
    const invitation = await prisma.platformInvitation.create({
      data: {
        email: data.email,
        token: data.token,
        invitedByUserId: data.invitedByUserId,
        expiresAt: data.expiresAt,
      },
    });

    return {
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      invitedByUserId: invitation.invitedByUserId,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
      createdAt: invitation.createdAt,
    };
  }

  async findByToken(token: string): Promise<PlatformInvitation | null> {
    const invitation = await prisma.platformInvitation.findUnique({
      where: {
        token,
      },
    });

    if (!invitation) {
      return null;
    }

    return {
      id: invitation.id,
      email: invitation.email,
      token: invitation.token,
      status: invitation.status,
      invitedByUserId: invitation.invitedByUserId,
      expiresAt: invitation.expiresAt,
      acceptedAt: invitation.acceptedAt,
      createdAt: invitation.createdAt,
    };
  }

  async markAsAccepted(id: string): Promise<void> {
    await prisma.platformInvitation.update({
      where: {
        id,
      },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });
  }
}
