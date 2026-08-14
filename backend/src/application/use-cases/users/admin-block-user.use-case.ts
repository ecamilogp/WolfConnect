import { User, UserStatus } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { requireAdminRequester, requireExistingUser } from './admin-user.guards.js';

export class AdminBlockUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(requester: User, targetUserId: string): Promise<User> {
    requireAdminRequester(requester, 'Only an administrator can block other users.');

    if (requester.id === targetUserId) {
      throw new BadRequestError('You cannot block your own account.');
    }

    const targetUser = await requireExistingUser(this.userRepository, targetUserId);

    if (targetUser.status === UserStatus.BLOCKED) {
      throw new BadRequestError('This account is already blocked.');
    }

    return this.userRepository.updateStatus(targetUserId, UserStatus.BLOCKED);
  }
}
