import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export function generateAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: '1d',
  });
}
