import bcrypt from 'bcrypt';

import { UserStatus } from '../../../domain/entities/user.entity.js';
import { UserRepository } from '../../../domain/repositories/user.repository.js';
import { CreateUserDTO } from '../../../domain/dto/user/create-user.dto.js';
import { ConflictError } from '../../../shared/errors/conflict-error.js';

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

export class RegisterUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: RegisterUserInput) {
    const existingEmail = await this.userRepository.findByEmail(input.email);

    if (existingEmail) {
      throw new ConflictError('Email already exists');
    }

    const existingUsername = await this.userRepository.findByUsername(input.username);

    if (existingUsername) {
      throw new ConflictError('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user: CreateUserDTO = {
      firstName: input.firstName,
      lastName: input.lastName,
      username: input.username,
      email: input.email,
      password: hashedPassword,
      profileImage: null,
      status: UserStatus.ACTIVE,
    };

    return this.userRepository.create(user);
  }
}
