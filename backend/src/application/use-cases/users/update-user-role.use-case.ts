import { User } from '../../../domain/entities/user.entity.js';
import { UpdateUserRoleDTO } from '../../../domain/dto/user/update-user-role.dto.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { requireAdminRequester, requireExistingUser } from './admin-user.guards.js';

export class UpdateUserRoleUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(requester: User, targetUserId: string, data: UpdateUserRoleDTO): Promise<User> {
    requireAdminRequester(requester, 'Only an administrator can manage administrator roles.');

    if (requester.id === targetUserId) {
      throw new ForbiddenError('You cannot change your own administrator role.');
    }

    const targetUser = await requireExistingUser(this.userRepository, targetUserId);

    return this.userRepository.updateRole(targetUser.id, data.role);
  }
}
