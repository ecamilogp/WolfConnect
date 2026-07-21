import { User } from '../../domain/entities/user.entity.js';
import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { prisma } from '../../infrastructure/database/prisma.js';
import { UserMapper } from '../../infrastructure/mappers/user.mapper.js';

export class PrismaUserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const createdUser = await prisma.user.create({
      data: UserMapper.toPersistence(user),
    });

    return UserMapper.toDomain(createdUser);
  }

  async findById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async findByEmail(email: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }

  async findByUsername(username: string): Promise<User | null> {
    throw new Error('Method not implemented.');
  }
}
