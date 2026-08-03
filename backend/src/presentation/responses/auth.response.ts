import type { UserResponse } from './user.response.js';

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
}
