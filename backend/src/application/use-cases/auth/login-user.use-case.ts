import bcrypt from 'bcrypt';
import { generateAccessToken } from '../../../shared/utils/jwt.js';
import { UnauthorizedError } from '../../../shared/errors/unauthorized-error.js';
import type { LoginUserDTO } from '../../../domain/dto/login-user.dto.js';
import type { UserRepository } from '../../../domain/repositories/user.repository.js';
import type { User } from '../../../domain/entities/user.entity.js';

export class LoginUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(dto: LoginUserDTO): Promise<{
    user: User;
    accessToken: string;
  }> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedError();
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedError();
    }

    const accessToken = generateAccessToken(user.id);

    return {
      user,
      accessToken,
    };
  }
}
