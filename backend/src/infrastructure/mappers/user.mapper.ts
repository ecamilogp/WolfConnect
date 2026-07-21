import { User as PrismaUser, UserStatus as PrismaUserStatus } from '@prisma/client';

import { User, UserStatus } from '../../domain/entities/user.entity.js';

export class UserMapper {
  static toDomain(user: PrismaUser): User {
    return new User(
      user.id,
      user.firstName,
      user.lastName,
      user.username,
      user.email,
      user.password,
      user.profileImage,
      user.status as UserStatus,
      user.createdAt,
      user.updatedAt,
      user.deletedAt,
    );
  }

  static toPersistence(user: User) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      password: user.password,
      profileImage: user.profileImage,
      status: user.status as PrismaUserStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}
