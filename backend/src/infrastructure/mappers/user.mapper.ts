import { User as PrismaUser, UserStatus as PrismaUserStatus } from '@prisma/client';
import { User, UserStatus } from '../../domain/entities/user.entity.js';
import { CreateUserDTO } from '../../domain/dto/create-user.dto.js';

export class UserMapper {
  static toDomain(user: PrismaUser): User {
    return new User({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      password: user.password,
      profileImage: user.profileImage,
      status: user.status as UserStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    });
  }

  static toCreatePersistence(createUser: CreateUserDTO) {
    return {
      firstName: createUser.firstName,
      lastName: createUser.lastName,
      username: createUser.username,
      email: createUser.email,
      password: createUser.password,
      profileImage: createUser.profileImage,
      status: createUser.status as PrismaUserStatus,
    };
  }
}
