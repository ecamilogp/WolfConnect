import { UserStatus } from '../entities/user.entity.js';

export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  profileImage: string | null;
  status: UserStatus;
}
