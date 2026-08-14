import { User, UserStatus } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { requireAdminRequester, requireExistingUser } from './admin-user.guards.js';

export class AdminReactivateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(requester: User, targetUserId: string): Promise<User> {
    requireAdminRequester(requester, 'Only an administrator can reactivate other users.');

    const targetUser = await requireExistingUser(this.userRepository, targetUserId);

    if (targetUser.status === UserStatus.ACTIVE) {
      throw new BadRequestError('This account is already active.');
    }

    return this.userRepository.updateStatus(targetUserId, UserStatus.ACTIVE);
  }
}
