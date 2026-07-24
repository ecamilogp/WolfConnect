import type { User } from '../../../domain/entities/user.entity.js';

export class GetCurrentUserUseCase {
  execute(user: User): User {
    return user;
  }
}
