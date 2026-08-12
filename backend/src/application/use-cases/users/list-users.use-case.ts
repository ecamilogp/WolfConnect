import { User, UserRole } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';

export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(requester: User): Promise<User[]> {
    if (requester.role !== UserRole.ADMIN) {
      throw new ForbiddenError('Only an administrator can view the user list.');
    }

    return this.userRepository.findAll();
  }
}
