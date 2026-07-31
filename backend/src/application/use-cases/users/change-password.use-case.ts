import bcrypt from 'bcrypt';

import { User } from '../../../domain/entities/user.entity.js';
import { ChangePasswordDTO } from '../../../domain/dto/user/change-password.dto.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';

import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { UnauthorizedError } from '../../../shared/errors/unauthorized-error.js';
import { BCRYPT_SALT_ROUNDS } from '../../../shared/constants/security.constant.js';

export class ChangePasswordUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(currentUser: User, data: ChangePasswordDTO): Promise<User> {
    const passwordMatches = await bcrypt.compare(data.currentPassword, currentUser.password);

    if (!passwordMatches) {
      throw new UnauthorizedError('Current password is incorrect.');
    }

    if (data.currentPassword === data.newPassword) {
      throw new BadRequestError('New password must be different from the current password.');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, BCRYPT_SALT_ROUNDS);

    return this.userRepository.updatePassword(currentUser.id, hashedPassword);
  }
}
