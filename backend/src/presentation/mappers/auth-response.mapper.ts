import type { User } from '../../domain/entities/user.entity.js';
import type { AuthResponse } from '../responses/auth.response.js';
import { UserResponseMapper } from './user-response.mapper.js';

export class AuthResponseMapper {
  static toResponse(user: User, accessToken: string): AuthResponse {
    return {
      user: UserResponseMapper.toResponse(user),
      accessToken,
    };
  }
}
