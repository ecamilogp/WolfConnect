import { NextFunction, Request, Response } from 'express';

import { PrismaChatRepository } from '../../infrastructure/repositories/prisma-chat.repository.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository.js';
import { PrismaGroupInvitationRepository } from '../../infrastructure/repositories/prisma-group-invitation.repository.js';
import { PrismaNotificationRepository } from '../../infrastructure/repositories/prisma-notification.repository.js';
import { SocketNotificationBroadcasterRepository } from '../../infrastructure/repositories/socket-notification-broadcaster.repository.js';
import { ChatResponseMapper } from '../mappers/chat-response.mapper.js';
import { CreatePrivateChatUseCase } from '../../application/use-cases/chat/create-private-chat.use-case.js';
import { CreateGroupChatUseCase } from '../../application/use-cases/chat/create-group-chat.use-case.js';
import { InviteUserToGroupUseCase } from '../../application/use-cases/chat/invite-user-to-group.use-case.js';
import { AcceptGroupInvitationUseCase } from '../../application/use-cases/chat/accept-group-invitation.use-case.js';
import { RejectGroupInvitationUseCase } from '../../application/use-cases/chat/reject-group-invitation.use-case.js';
import { LeaveGroupUseCase } from '../../application/use-cases/chat/leave-group.use-case.js';
import { DeleteGroupUseCase } from '../../application/use-cases/chat/delete-group.use-case.js';
import { GetChatsUseCase } from '../../application/use-cases/chat/get-chats.use-case.js';
import { UpdateGroupUseCase } from '../../application/use-cases/chat/update-group.use-case.js';
import { PromoteToAdminUseCase } from '../../application/use-cases/chat/promote-to-admin.use-case.js';
import { DemoteAdminUseCase } from '../../application/use-cases/chat/demote-admin.use-case.js';
import { RemoveParticipantUseCase } from '../../application/use-cases/chat/remove-participant.use-case.js';
import { TransferOwnershipUseCase } from '../../application/use-cases/chat/transfer-ownership.use-case.js';
import { SendNotificationUseCase } from '../../application/use-cases/notification/send-notification.use-case.js';
import { SocketEventName, SocketEvents } from '../../infrastructure/websocket/events/socket-events.enum.js';
import { chatRoom } from '../../infrastructure/websocket/handlers/chat.handler.js';
import { getIO, userRoom } from '../../infrastructure/websocket/socket.server.js';
import {
  GroupOwnershipTransferredPayload,
  GroupParticipantRemovedPayload,
  GroupRoleChangedPayload,
  GroupUpdatedPayload,
} from '../../infrastructure/websocket/types/socket-payloads.type.js';

export class ChatController {
  private readonly chatRepository = new PrismaChatRepository();

  private readonly userRepository = new PrismaUserRepository();

  private readonly groupInvitationRepository = new PrismaGroupInvitationRepository();

  private readonly notificationRepository = new PrismaNotificationRepository();

  private readonly notificationBroadcaster = new SocketNotificationBroadcasterRepository();

  private readonly sendNotificationUseCase = new SendNotificationUseCase(
    this.notificationRepository,
    this.notificationBroadcaster,
  );

  private readonly createPrivateChatUseCase = new CreatePrivateChatUseCase(this.chatRepository);

  private readonly createGroupChatUseCase = new CreateGroupChatUseCase(this.chatRepository);

  private readonly inviteUserToGroupUseCase = new InviteUserToGroupUseCase(
    this.chatRepository,
    this.userRepository,
    this.groupInvitationRepository,
    this.sendNotificationUseCase,
  );

  private readonly acceptGroupInvitationUseCase = new AcceptGroupInvitationUseCase(
    this.chatRepository,
    this.groupInvitationRepository,
    this.userRepository,
    this.sendNotificationUseCase,
  );

  private readonly rejectGroupInvitationUseCase = new RejectGroupInvitationUseCase(
    this.groupInvitationRepository,
    this.chatRepository,
    this.userRepository,
    this.sendNotificationUseCase,
  );

  private readonly leaveGroupUseCase = new LeaveGroupUseCase(this.chatRepository);

  private readonly deleteGroupUseCase = new DeleteGroupUseCase(this.chatRepository);

  private readonly getChatsUseCase = new GetChatsUseCase(this.chatRepository);

  private readonly updateGroupUseCase = new UpdateGroupUseCase(this.chatRepository);

  private readonly promoteToAdminUseCase = new PromoteToAdminUseCase(this.chatRepository);

  private readonly demoteAdminUseCase = new DemoteAdminUseCase(this.chatRepository);

  private readonly removeParticipantUseCase = new RemoveParticipantUseCase(this.chatRepository);

  private readonly transferOwnershipUseCase = new TransferOwnershipUseCase(this.chatRepository);

  private emitGroupEvent<T>(event: SocketEventName, chatId: string, payload: T): void {
    try {
      getIO().to(chatRoom(chatId)).emit(event, payload);
    } catch (socketError) {
      console.error('[group:socket-emit-failed]', socketError);
    }
  }

  private async notifyNewPrivateChat(chatId: string, targetUserId: string): Promise<void> {
    const io = getIO();

    await io.in(userRoom(targetUserId)).socketsJoin(chatRoom(chatId));

    const summaries = await this.chatRepository.findAllByUser(targetUserId);
    const summary = summaries.find((item) => item.id === chatId);

    if (summary) {
      io.to(userRoom(targetUserId)).emit(SocketEvents.CHAT_NEW, summary);
    }
  }

  createPrivateChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { chat, isNew } = await this.createPrivateChatUseCase.execute({
        currentUserId: req.user.id,
        targetUserId: req.body.targetUserId,
      });

      const response = ChatResponseMapper.toResponse(chat);

      res.status(201).json({
        success: true,
        message: 'Private chat created successfully.',
        data: response,
      });

      if (isNew) {
        this.notifyNewPrivateChat(chat.id, req.body.targetUserId).catch((socketError) => {
          console.error('[chat:socket-emit-failed]', socketError);
        });
      }
    } catch (error) {
      next(error);
    }
  };

  createGroupChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chat = await this.createGroupChatUseCase.execute({
        creatorUserId: req.user.id,
        name: req.body.name,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
        joinPolicy: req.body.joinPolicy,
      });

      const response = ChatResponseMapper.toResponse(chat);

      res.status(201).json({
        success: true,
        message: 'Group chat created successfully.',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  inviteUserToGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.inviteUserToGroupUseCase.execute({
        inviterUserId: req.user.id,
        chatId: String(req.params.chatId),
        invitedUserId: req.body.invitedUserId,
      });

      res.status(200).json({
        success: true,
        message: 'User invited successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  acceptGroupInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.acceptGroupInvitationUseCase.execute(
        String(req.params.invitationId),
        req.user.id,
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  rejectGroupInvitation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.rejectGroupInvitationUseCase.execute(
        String(req.params.invitationId),
        req.user.id,
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  leaveGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.leaveGroupUseCase.execute(String(req.params.chatId), req.user.id);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.deleteGroupUseCase.execute(String(req.params.chatId), req.user.id);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  getChats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chats = await this.getChatsUseCase.execute(req.user.id);

      res.status(200).json({
        success: true,
        data: chats,
      });
    } catch (error) {
      next(error);
    }
  };

  updateGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chat = await this.updateGroupUseCase.execute({
        chatId: String(req.params.chatId),
        requesterUserId: req.user.id,
        name: req.body.name,
        description: req.body.description,
        imageUrl: req.body.imageUrl,
      });

      const payload: GroupUpdatedPayload = chat;

      this.emitGroupEvent(SocketEvents.GROUP_UPDATED, chat.id, payload);

      const response = ChatResponseMapper.toResponse(chat);

      res.status(200).json({
        success: true,
        message: 'Group updated successfully.',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  promoteToAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chatId = String(req.params.chatId);
      const targetUserId = String(req.params.userId);

      const result = await this.promoteToAdminUseCase.execute({
        chatId,
        requesterUserId: req.user.id,
        targetUserId,
      });

      const payload: GroupRoleChangedPayload = { chatId, userId: targetUserId, role: 'ADMIN' };

      this.emitGroupEvent(SocketEvents.GROUP_ROLE_CHANGED, chatId, payload);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  demoteAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chatId = String(req.params.chatId);
      const targetUserId = String(req.params.userId);

      const result = await this.demoteAdminUseCase.execute({
        chatId,
        requesterUserId: req.user.id,
        targetUserId,
      });

      const payload: GroupRoleChangedPayload = { chatId, userId: targetUserId, role: 'MEMBER' };

      this.emitGroupEvent(SocketEvents.GROUP_ROLE_CHANGED, chatId, payload);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  removeParticipant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chatId = String(req.params.chatId);
      const targetUserId = String(req.params.userId);

      const result = await this.removeParticipantUseCase.execute({
        chatId,
        requesterUserId: req.user.id,
        targetUserId,
      });

      const payload: GroupParticipantRemovedPayload = { chatId, userId: targetUserId };

      this.emitGroupEvent(SocketEvents.GROUP_PARTICIPANT_REMOVED, chatId, payload);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  transferOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chatId = String(req.params.chatId);
      const targetUserId = String(req.params.userId);
      const previousOwnerId = req.user.id;

      const result = await this.transferOwnershipUseCase.execute({
        chatId,
        requesterUserId: previousOwnerId,
        targetUserId,
      });

      const payload: GroupOwnershipTransferredPayload = {
        chatId,
        previousOwnerId,
        newOwnerId: targetUserId,
      };

      this.emitGroupEvent(SocketEvents.GROUP_OWNERSHIP_TRANSFERRED, chatId, payload);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };
}
