import { PlatformInvitation as PrismaPlatformInvitation } from '@prisma/client';

import { CreatePlatformInvitationDto } from '../../domain/dto/platform-invitation/create-platform-invitation.dto.js';
import { PlatformInvitationResponseDto } from '../../domain/dto/platform-invitation/platform-invitation-response.dto.js';
import { PlatformInvitation } from '../../domain/entities/platform-invitation.entity.js';
import { PlatformInvitationRepository } from '../../domain/repositories/platform-invitation.repository.js';
import { prisma } from '../database/prisma.service.js';

export class PrismaPlatformInvitationRepository implements PlatformInvitationRepository {
  private toResponseDto(invitation: PrismaPlatformInvitation): PlatformInvitationResponseDto {
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

  private toEntity(invitation: PrismaPlatformInvitation): PlatformInvitation {
    return {
      ...this.toResponseDto(invitation),
      token: invitation.token,
    };
  }

  async create(data: CreatePlatformInvitationDto): Promise<PlatformInvitationResponseDto> {
    const invitation = await prisma.platformInvitation.create({
      data: {
        email: data.email,
        token: data.token,
        invitedByUserId: data.invitedByUserId,
        expiresAt: data.expiresAt,
      },
    });

    return this.toResponseDto(invitation);
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

    return this.toEntity(invitation);
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
