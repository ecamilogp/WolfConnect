import { ExtendedError } from 'socket.io';

import { PrismaUserRepository } from '../../repositories/prisma-user.repository.js';
import { verifyAccessToken } from '../../../shared/utils/jwt.js';
import { AuthenticatedSocket } from '../socket.types.js';

const userRepository = new PrismaUserRepository();

export async function socketAuthMiddleware(
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError) => void,
): Promise<void> {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token is required.'));
    }

    const payload = verifyAccessToken(token);

    const user = await userRepository.findById(payload.sub);

    if (!user) {
      return next(new Error('User not found.'));
    }

    socket.data.user = user;

    next();
  } catch {
    next(new Error('Invalid or expired authentication token.'));
  }
}
