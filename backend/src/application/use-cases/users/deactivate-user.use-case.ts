import { User, UserStatus } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';

export class DeactivateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(currentUser: User): Promise<void> {
    if (currentUser.status === UserStatus.INACTIVE) {
      throw new BadRequestError('Your account is already deactivated.');
    }

    if (currentUser.status === UserStatus.BLOCKED) {
      throw new BadRequestError('Blocked accounts cannot be deactivated.');
    }

    await this.userRepository.deactivate(currentUser.id);
  }
}
