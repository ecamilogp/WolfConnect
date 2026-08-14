import { User, UserRole, UserStatus } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class AdminReactivateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(requester: User, targetUserId: string): Promise<User> {
    if (requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only an administrator can reactivate other users.');
    }

    const targetUser = await this.userRepository.findById(targetUserId);

    if (!targetUser) {
      throw new NotFoundError('User not found.');
    }

    if (targetUser.status === UserStatus.ACTIVE) {
      throw new BadRequestError('This account is already active.');
    }

    return this.userRepository.updateStatus(targetUserId, UserStatus.ACTIVE);
  }
}
