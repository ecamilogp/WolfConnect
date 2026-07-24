import { NextFunction, Request, Response } from 'express';

import { verifyAccessToken } from '../../shared/utils/jwt.js';
import { UnauthorizedError } from '../../shared/errors/unauthorized-error.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository.js';

const userRepository = new PrismaUserRepository();

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedError('Authentication token is required.');
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedError('Invalid authentication token.');
    }

    const payload = verifyAccessToken(token);

    const user = await userRepository.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedError('User not found.');
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}
