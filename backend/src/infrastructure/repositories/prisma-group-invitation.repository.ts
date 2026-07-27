import { prisma } from '../database/prisma.service.js';
import { GroupInvitationRepository } from '../../domain/repositories/group-invitation.repository.js';
import { GroupInvitation } from '../../domain/entities/group-invitation.entity.js';
import { CreateGroupInvitationDto } from '../../domain/dto/group-invitations/create-group-invitation.dto.js';

export class PrismaGroupInvitationRepository implements GroupInvitationRepository {
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

  async findById(id: string): Promise<GroupInvitation | null> {
    const invitation = await prisma.groupInvitation.findUnique({
      where: {
        id,
      },
    });

    if (!invitation) {
      return null;
    }

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

  async create(dto: CreateGroupInvitationDto): Promise<GroupInvitation> {
    const invitation = await prisma.groupInvitation.create({
      data: {
        chatId: dto.chatId,
        invitedByUserId: dto.invitedByUserId,
        invitedUserId: dto.invitedUserId,
        status: 'PENDING',
      },
    });

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

  async updateStatus(
    id: string,
    status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED',
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
}
