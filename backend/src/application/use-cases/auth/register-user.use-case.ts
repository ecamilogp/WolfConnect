import bcrypt from 'bcrypt';

import { UserStatus } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { PlatformInvitationRepository } from '../../../domain/repositories/platform-invitation.repository.js';
import { CreateUserDTO } from '../../../domain/dto/user/create-user.dto.js';
import { RegisterUserDTO } from '../../../domain/dto/auth/register-user.dto.js';
import { ConflictError } from '../../../shared/errors/conflict-error.js';
import { BCRYPT_SALT_ROUNDS } from '../../../shared/constants/security.constant.js';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly platformInvitationRepository: PlatformInvitationRepository,
  ) {}

  async execute(input: RegisterUserDTO) {
    const existingEmail = await this.userRepository.findByEmail(input.email);

    if (existingEmail) {
      throw new ConflictError('Email already exists');
    }

    const existingUsername = await this.userRepository.findByUsername(input.username);

    if (existingUsername) {
      throw new ConflictError('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    const user: CreateUserDTO = {
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      password: hashedPassword,
      profileImage: null,
      status: UserStatus.ACTIVE,
    };

    const createdUser = await this.userRepository.create(user);

    if (input.invitationToken) {
      const invitation = await this.platformInvitationRepository.findByToken(
        input.invitationToken,
      );

      if (invitation && invitation.status === 'PENDING') {
        await this.platformInvitationRepository.markAsAccepted(invitation.id);
      }
    }

    return createdUser;
  }
}
