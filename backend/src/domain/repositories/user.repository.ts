import { User, UserRole } from '../entities/user.entity.js';
import { CreateUserDTO } from '../dto/user/create-user.dto.js';
import { UpdateUserDTO } from '../dto/user/update-user.dto.js';

export interface UserRepository {
  create(user: CreateUserDTO): Promise<User>;

  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findByUsername(username: string): Promise<User | null>;

  search(query: string, excludeUserId: string): Promise<User[]>;

  findAll(): Promise<User[]>;

  update(id: string, data: UpdateUserDTO): Promise<User>;

  updatePassword(id: string, password: string): Promise<User>;

  updateRole(id: string, role: UserRole): Promise<User>;

  deactivate(id: string): Promise<User>;
}
