import { z } from 'zod';
import { passwordSchema } from '../common/password.schema.js';

const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]+$/;

const usernameRegex = /^[a-zA-Z0-9._]+$/;

export const registerUserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters.')
    .max(50, 'First name cannot exceed 50 characters.')
    .regex(nameRegex, 'First name contains invalid characters.'),

  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters.')
    .max(50, 'Last name cannot exceed 50 characters.')
    .regex(nameRegex, 'Last name contains invalid characters.'),

  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username cannot exceed 30 characters.')
    .regex(usernameRegex, 'Username can only contain letters, numbers, dots and underscores.'),

  email: z.string().trim().toLowerCase().pipe(z.email({ message: 'Invalid email address.' })),

  password: passwordSchema,

  invitationToken: z.string().trim().min(1).optional(),
});
