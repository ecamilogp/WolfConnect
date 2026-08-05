import { User } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';

export class SearchUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: string, currentUserId: string): Promise<User[]> {
    return this.userRepository.search(query, currentUserId);
  }
}
