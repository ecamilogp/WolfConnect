import { User } from '../../domain/entities/user.entity.js';
import { UserResponse } from '../responses/user.response.js';

export class UserResponseMapper {
  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      profileImage: user.profileImage,
      status: user.status,
    };
  }
}
