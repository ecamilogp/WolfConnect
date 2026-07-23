import { User } from '../entities/user.entity.js';
import { CreateUserDTO } from '../dto/create-user.dto.js';

export interface UserRepository {
  create(user: CreateUserDTO): Promise<User>;

  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findByUsername(username: string): Promise<User | null>;
}
