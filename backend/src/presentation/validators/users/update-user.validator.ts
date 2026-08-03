import { z } from 'zod';

export const updateUserSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100).optional(),

    lastName: z.string().trim().min(1).max(100).optional(),

    username: z.string().trim().min(3).max(30).optional(),

    profileImage: z.url().optional().nullable(),
  })
  .strict();
