import { User, UserProps, UserRole, UserStatus } from '../../src/domain/entities/user.entity.js';
import { UserRepository } from '../../src/domain/repositories/user.repository.js';

export function buildUser(overrides: Partial<UserProps> = {}): User {
  const base: UserProps = {
    id: 'user-1',
    firstName: 'Jane',
    lastName: 'Doe',
    username: 'janedoe',
    email: 'jane@example.com',
    password: 'hashed-password',
    profileImage: null,
    status: UserStatus.ACTIVE,
    role: UserRole.USER,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    deletedAt: null,
  };

  return new User({ ...base, ...overrides });
}

export class FakeUserRepository implements UserRepository {
  users: User[];

  constructor(users: User[] = []) {
    this.users = users;
  }

  async create(): Promise<User> {
    throw new Error('create is not implemented in this fake.');
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) ?? null;
  }

  async findByEmail(): Promise<User | null> {
    throw new Error('findByEmail is not implemented in this fake.');
  }

  async findByUsername(): Promise<User | null> {
    throw new Error('findByUsername is not implemented in this fake.');
  }

  async search(): Promise<User[]> {
    throw new Error('search is not implemented in this fake.');
  }

  async findAll(): Promise<User[]> {
    throw new Error('findAll is not implemented in this fake.');
  }

  async update(): Promise<User> {
    throw new Error('update is not implemented in this fake.');
  }

  async updatePassword(): Promise<User> {
    throw new Error('updatePassword is not implemented in this fake.');
  }

  async updateRole(): Promise<User> {
    throw new Error('updateRole is not implemented in this fake.');
  }

  async deactivate(): Promise<User> {
    throw new Error('deactivate is not implemented in this fake.');
  }

  async updateStatus(): Promise<User> {
    throw new Error('updateStatus is not implemented in this fake.');
  }
}
