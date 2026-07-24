import { AppError } from './app-error.js';

export class UnauthorizedError extends AppError {
  constructor(message = 'Invalid email or password') {
    super(message, 401);
  }
}
