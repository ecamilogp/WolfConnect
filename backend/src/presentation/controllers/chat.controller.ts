import { NextFunction, Request, Response } from 'express';

import { CreatePrivateChatUseCase } from '../../application/use-cases/chat/create-private-chat.use-case.js';
import { PrismaChatRepository } from '../../infrastructure/repositories/prisma-chat.repository.js';
import { ChatResponseMapper } from '../mappers/chat-response.mapper.js';
import { CreateGroupChatUseCase } from '../../application/use-cases/chat/create-group-chat.use-case.js';
import { InviteUserToGroupUseCase } from '../../application/use-cases/chat/invite-user-to-group.use-case.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository.js';
import { PrismaGroupInvitationRepository } from '../../infrastructure/repositories/prisma-group-invitation.repository.js';
import { AcceptGroupInvitationUseCase } from '../../application/use-cases/chat/accept-group-invitation.use-case.js';
import { RejectGroupInvitationUseCase } from '../../application/use-cases/chat/reject-group-invitation.use-case.js';
import { LeaveGroupUseCase } from '../../application/use-cases/chat/leave-group.use-case.js';
import { DeleteGroupUseCase } from '../../application/use-cases/chat/delete-group.use-case.js';

export class ChatController {
  private readonly chatRepository = new PrismaChatRepository();

  private readonly userRepository = new PrismaUserRepository();

  private readonly groupInvitationRepository = new PrismaGroupInvitationRepository();

  private readonly createPrivateChatUseCase = new CreatePrivateChatUseCase(this.chatRepository);

  private readonly createGroupChatUseCase = new CreateGroupChatUseCase(this.chatRepository);

  private readonly inviteUserToGroupUseCase = new InviteUserToGroupUseCase(
    this.chatRepository,
    this.userRepository,
    this.groupInvitationRepository,
  );

  private readonly acceptGroupInvitationUseCase = new AcceptGroupInvitationUseCase(
    this.chatRepository,
    this.groupInvitationRepository,
  );

  private readonly rejectGroupInvitationUseCase = new RejectGroupInvitationUseCase(
    this.groupInvitationRepository,
  );

  private readonly leaveGroupUseCase = new LeaveGroupUseCase(this.chatRepository);

  private readonly deleteGroupUseCase = new DeleteGroupUseCase(this.chatRepository);

  createPrivateChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const chat = await this.createPrivateChatUseCase.execute({
        currentUserId: req.user.id,
        targetUserId: req.body.targetUserId,
      });

      const response = ChatResponseMapper.toResponse(chat);

      res.status(201).json({
        success: true,
        message: 'Private chat created successfully.',
        data: response,
      });
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
}
