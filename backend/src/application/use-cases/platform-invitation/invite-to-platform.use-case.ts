import { randomBytes } from 'node:crypto';

import { env } from '../../../config/env.js';
import { PLATFORM_INVITATION_EXPIRATION_DAYS } from '../../../config/platform-invitation.config.js';
import { InviteToPlatformDto } from '../../../domain/dto/platform-invitation/invite-to-platform.dto.js';
import { PlatformInvitationResponseDto } from '../../../domain/dto/platform-invitation/platform-invitation-response.dto.js';
import { MailerRepository } from '../../../domain/repositories/mailer.repository.js';
import { PlatformInvitationRepository } from '../../../domain/repositories/platform-invitation.repository.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { ConflictError } from '../../../shared/errors/conflict-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';
import { buildPlatformInvitationEmailHtml } from './platform-invitation-email.template.js';

export class InviteToPlatformUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly platformInvitationRepository: PlatformInvitationRepository,
    private readonly mailerRepository: MailerRepository,
  ) {}

  async execute(dto: InviteToPlatformDto): Promise<PlatformInvitationResponseDto> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictError('This email is already registered on WolfConnect.');
    }

    const inviter = await this.userRepository.findById(dto.invitedByUserId);

    if (!inviter) {
      throw new NotFoundError('Inviter not found.');
    }

    const token = randomBytes(32).toString('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + PLATFORM_INVITATION_EXPIRATION_DAYS);

    // If this email already has a pending (not yet accepted) invitation, refresh it in
    // place instead of creating a duplicate row — this lets anyone resend an invitation
    // as many times as needed until the recipient actually registers.
    const existingInvitation =
      await this.platformInvitationRepository.findLatestPendingByEmail(normalizedEmail);

    const invitation = existingInvitation
      ? await this.platformInvitationRepository.renew(existingInvitation.id, { token, expiresAt })
      : await this.platformInvitationRepository.create({
          email: normalizedEmail,
          token,
          invitedByUserId: dto.invitedByUserId,
          expiresAt,
        });

    const joinUrl = `${env.FRONTEND_URL}/register?invitationToken=${token}`;

    await this.mailerRepository.send({
      to: normalizedEmail,
      subject: `${inviter.firstName} invited you to WolfConnect`,
      html: buildPlatformInvitationEmailHtml({
        inviterName: `${inviter.firstName} ${inviter.lastName}`,
        token,
        joinUrl,
        expiresInDays: PLATFORM_INVITATION_EXPIRATION_DAYS,
      }),
    });

    return invitation;
  }
}
