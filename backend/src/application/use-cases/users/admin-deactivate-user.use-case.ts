import { User, UserStatus } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { requireAdminRequester, requireExistingUser } from './admin-user.guards.js';

export class AdminDeactivateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(requester: User, targetUserId: string): Promise<User> {
    requireAdminRequester(requester, 'Only an administrator can deactivate other users.');

    if (requester.id === targetUserId) {
      throw new BadRequestError('Use the account deactivation endpoint to deactivate yourself.');
    }

    const targetUser = await requireExistingUser(this.userRepository, targetUserId);

    if (targetUser.status === UserStatus.INACTIVE) {
      throw new BadRequestError('This account is already deactivated.');
    }

    if (targetUser.status === UserStatus.BLOCKED) {
      throw new BadRequestError('Blocked accounts cannot be deactivated.');
    }

    return this.userRepository.deactivate(targetUserId);
  }
}
