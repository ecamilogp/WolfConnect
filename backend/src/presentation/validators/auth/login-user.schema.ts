import { z } from 'zod';

export const loginUserSchema = z.object({
  email: z.email({ message: 'Invalid email address.' }).trim().toLowerCase(),

  password: z.string().min(1, 'Password is required.'),
});
