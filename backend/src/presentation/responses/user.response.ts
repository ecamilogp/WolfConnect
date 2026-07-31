import { UserRole, UserStatus } from '../../domain/entities/user.entity.js';

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  profileImage: string | null;
  status: UserStatus;
  role: UserRole;
}
