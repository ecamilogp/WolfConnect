import { User, UserRole } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export function requireAdminRequester(requester: User, message: string): void {
  if (requester.role !== UserRole.ADMIN) {
    throw new ForbiddenError(message);
  }
}

export async function requireExistingUser(userRepository: UserRepository, userId: string): Promise<User> {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found.');
  }

  return user;
}
