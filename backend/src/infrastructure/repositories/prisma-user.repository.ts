import { User, UserStatus } from '../../domain/entities/user.entity.js';
import { UserRepository } from '../../domain/repositories/user.repository.js';
import { prisma } from '../database/prisma.service.js';
import { UserMapper } from '../mappers/user.mapper.js';
import { CreateUserDTO } from '../../domain/dto/create-user.dto.js';
import { UpdateUserDTO } from '../../domain/dto/update-user.dto.js';

export class PrismaUserRepository implements UserRepository {
  async create(user: CreateUserDTO): Promise<User> {
    const createdUser = await prisma.user.create({
      data: UserMapper.toCreatePersistence(user),
    });

    return UserMapper.toDomain(createdUser);
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data,
    });

    return UserMapper.toDomain(user);
  }

  async updatePassword(id: string, password: string): Promise<User> {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        password,
      },
    });

    return UserMapper.toDomain(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        status: UserStatus.INACTIVE,
      },
    });

    return UserMapper.toDomain(user);
  }
}
