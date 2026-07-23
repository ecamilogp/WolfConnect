import { z } from 'zod';

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

  email: z.string().trim().toLowerCase().email('Invalid email address.'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(100, 'Password cannot exceed 100 characters.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(
      /[!@#$%^&*()_\-+=\\[\]{};:'",.<>/?\\|`~]/,
      'Password must contain at least one special character.',
    )
    .regex(/^\S+$/, 'Password cannot contain spaces.'),
});
