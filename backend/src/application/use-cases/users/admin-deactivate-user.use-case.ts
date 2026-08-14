import { User, UserRole, UserStatus } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class AdminDeactivateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(requester: User, targetUserId: string): Promise<User> {
    if (requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only an administrator can deactivate other users.');
    }

    if (requester.id === targetUserId) {
      throw new BadRequestError('Use the account deactivation endpoint to deactivate yourself.');
    }

    const targetUser = await this.userRepository.findById(targetUserId);

    if (!targetUser) {
      throw new NotFoundError('User not found.');
    }

    if (targetUser.status === UserStatus.INACTIVE) {
      throw new BadRequestError('This account is already deactivated.');
    }

    if (targetUser.status === UserStatus.BLOCKED) {
      throw new BadRequestError('Blocked accounts cannot be deactivated.');
    }

    return this.userRepository.deactivate(targetUserId);
  }
}
