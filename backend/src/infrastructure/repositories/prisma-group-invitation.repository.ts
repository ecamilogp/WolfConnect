import { InvitationStatus, GroupInvitation as PrismaGroupInvitation } from '@prisma/client';
import { prisma } from '../database/prisma.service.js';
import { GroupInvitationRepository } from '../../domain/repositories/group-invitation.repository.js';
import { GroupInvitation } from '../../domain/entities/group-invitation.entity.js';
import { CreateGroupInvitationDto } from '../../domain/dto/chat-group-invitations/create-group-invitation.dto.js';

export class PrismaGroupInvitationRepository implements GroupInvitationRepository {
  private toDomain(invitation: PrismaGroupInvitation): GroupInvitation {
    return {
      id: invitation.id,
      chatId: invitation.chatId,
      invitedByUserId: invitation.invitedByUserId,
      invitedUserId: invitation.invitedUserId,
      status: invitation.status,
      createdAt: invitation.createdAt,
      respondedAt: invitation.respondedAt,
    };
  }

  async findPendingInvitation(
    chatId: string,
    invitedUserId: string,
  ): Promise<GroupInvitation | null> {
    const invitation = await prisma.groupInvitation.findFirst({
      where: {
        chatId,
        invitedUserId,
        status: 'PENDING',
      },
    });

    if (!invitation) {
      return null;
    }

    return this.toDomain(invitation);
  }

  async findById(id: string): Promise<GroupInvitation | null> {
    const invitation = await prisma.groupInvitation.findUnique({
      where: {
        id,
      },
    });

    if (!invitation) {
      return null;
    }

    return this.toDomain(invitation);
  }

  async create(dto: CreateGroupInvitationDto): Promise<GroupInvitation> {
    const invitation = await prisma.groupInvitation.create({
      data: {
        chatId: dto.chatId,
        invitedByUserId: dto.invitedByUserId,
        invitedUserId: dto.invitedUserId,
        status: 'PENDING',
      },
    });

    return this.toDomain(invitation);
  }

  async updateStatus(
    id: string,
    status: Exclude<InvitationStatus, 'PENDING'>,
  ): Promise<GroupInvitation> {
    const invitation = await prisma.groupInvitation.update({
      where: {
        id,
      },
      data: {
        status,
        respondedAt: new Date(),
      },
    });

    return this.toDomain(invitation);
  }
}
