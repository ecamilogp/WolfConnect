import { User, UserRole } from '../../../domain/entities/user.entity.js';
import { UpdateUserRoleDTO } from '../../../domain/dto/user/update-user-role.dto.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export class UpdateUserRoleUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(requester: User, targetUserId: string, data: UpdateUserRoleDTO): Promise<User> {
    if (requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only an administrator can manage administrator roles.');
    }

    if (requester.id === targetUserId) {
      throw new ForbiddenError('You cannot change your own administrator role.');
    }

    const targetUser = await this.userRepository.findById(targetUserId);

    if (!targetUser) {
      throw new NotFoundError('User not found.');
    }

    return this.userRepository.updateRole(targetUserId, data.role);
  }
}
