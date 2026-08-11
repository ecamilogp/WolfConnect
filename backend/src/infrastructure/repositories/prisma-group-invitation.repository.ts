import { InvitationStatus, GroupInvitation as PrismaGroupInvitation } from '@prisma/client';
import { prisma } from '../database/prisma.service.js';
import { GroupInvitationRepository } from '../../domain/repositories/group-invitation.repository.js';
import { GroupInvitation } from '../../domain/entities/group-invitation.entity.js';
import { CreateGroupInvitationDto } from '../../domain/dto/chat-group-invitations/create-group-invitation.dto.js';
import { PendingInvitationSummaryDto } from '../../domain/dto/chat-group-invitations/pending-invitation-summary.dto.js';

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

  async findPendingByInvitedUser(invitedUserId: string): Promise<PendingInvitationSummaryDto[]> {
    const invitations = await prisma.groupInvitation.findMany({
      where: {
        invitedUserId,
        status: 'PENDING',
      },
      include: {
        chat: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
        invitedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return invitations.map((invitation) => ({
      id: invitation.id,
      chatId: invitation.chatId,
      groupName: invitation.chat.name ?? '',
      groupImageUrl: invitation.chat.imageUrl,
      invitedByUserId: invitation.invitedByUserId,
      invitedByName: `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`,
      createdAt: invitation.createdAt,
    }));
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
    const invitation = await prisma.groupInvitation.upsert({
      where: {
        chatId_invitedUserId: {
          chatId: dto.chatId,
          invitedUserId: dto.invitedUserId,
        },
      },
      create: {
        chatId: dto.chatId,
        invitedByUserId: dto.invitedByUserId,
        invitedUserId: dto.invitedUserId,
        status: 'PENDING',
      },
      update: {
        invitedByUserId: dto.invitedByUserId,
        status: 'PENDING',
        createdAt: new Date(),
        respondedAt: null,
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
