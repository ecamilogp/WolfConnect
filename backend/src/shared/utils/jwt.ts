import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export interface JwtPayload {
  sub: string;
}

export function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: '1d',
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
