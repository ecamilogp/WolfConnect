import { NextFunction, Request, Response } from 'express';

import { InviteToPlatformUseCase } from '../../application/use-cases/platform-invitation/invite-to-platform.use-case.js';
import { NodemailerMailerRepository } from '../../infrastructure/repositories/nodemailer-mailer.repository.js';
import { PrismaPlatformInvitationRepository } from '../../infrastructure/repositories/prisma-platform-invitation.repository.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository.js';

export class PlatformInvitationController {
  private readonly userRepository = new PrismaUserRepository();

  private readonly platformInvitationRepository = new PrismaPlatformInvitationRepository();

  private readonly mailerRepository = new NodemailerMailerRepository();

  private readonly inviteToPlatformUseCase = new InviteToPlatformUseCase(
    this.userRepository,
    this.platformInvitationRepository,
    this.mailerRepository,
  );

  invite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invitation = await this.inviteToPlatformUseCase.execute({
        email: req.body.email,
        invitedByUserId: req.user.id,
      });

      res.status(201).json({
        success: true,
        message: 'Invitation sent successfully.',
        data: invitation,
      });
    } catch (error) {
      next(error);
    }
  };
}
