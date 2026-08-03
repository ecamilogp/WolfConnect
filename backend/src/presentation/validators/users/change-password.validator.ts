import { z } from 'zod';

import { passwordSchema } from '../common/password.schema.js';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.').max(100),

    newPassword: passwordSchema,
  })
  .strict();
