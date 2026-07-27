import { NextFunction, Request, Response } from 'express';

import { CreatePrivateChatUseCase } from '../../application/use-cases/chat/create-private-chat.use-case.js';
import { PrismaChatRepository } from '../../infrastructure/repositories/prisma-chat.repository.js';
import { ChatResponseMapper } from '../mappers/chat-response.mapper.js';
import { CreateGroupChatUseCase } from '../../application/use-cases/chat/create-group-chat.use-case.js';
import { InviteUserToGroupUseCase } from '../../application/use-cases/chat/invite-user-to-group.use-case.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository.js';
import { PrismaGroupInvitationRepository } from '../../infrastructure/repositories/prisma-group-invitation.repository.js';

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

      res.status(201).json({
        success: true,
        message: 'User invited successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}
