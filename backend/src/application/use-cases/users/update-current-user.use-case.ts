import { User } from '../../../domain/entities/user.entity.js';
import { UpdateUserDTO } from '../../../domain/dto/update-user.dto.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { BadRequestError } from '../../../shared/errors/bad-request-error.js';
import { ConflictError } from '../../../shared/errors/conflict-error.js';

export class UpdateCurrentUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(currentUser: User, data: UpdateUserDTO): Promise<User> {
    if (Object.keys(data).length === 0) {
      throw new BadRequestError('No fields provided to update.');
    }

    if (data.username) {
      const existingUser = await this.userRepository.findByUsername(data.username);

      if (existingUser && existingUser.id !== currentUser.id) {
        throw new ConflictError('Username is already in use.');
      }
    }

    return this.userRepository.update(currentUser.id, data);
  }
}
