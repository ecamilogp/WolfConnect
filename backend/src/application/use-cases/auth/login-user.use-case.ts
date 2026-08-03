import bcrypt from 'bcrypt';

import { generateAccessToken } from '../../../shared/utils/jwt.js';
import { UnauthorizedError } from '../../../shared/errors/unauthorized-error.js';

import type { LoginUserDTO } from '../../../domain/dto/auth/login-user.dto.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import { UserStatus, type User } from '../../../domain/entities/user.entity.js';

export class LoginUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: LoginUserDTO): Promise<{
    user: User;
    accessToken: string;
  }> {
    const user = await this.userRepository.findByEmail(dto.email);

    const passwordMatches = user ? await bcrypt.compare(dto.password, user.password) : false;

    if (!user || !passwordMatches) {
      throw new UnauthorizedError();
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedError('Your account has been deactivated.');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedError('Your account has been blocked.');
    }

    const accessToken = generateAccessToken(user.id);

    return {
      user,
      accessToken,
    };
  }
}
