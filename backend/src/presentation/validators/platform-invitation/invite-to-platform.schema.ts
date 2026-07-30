import { z } from 'zod';

export const inviteToPlatformSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address.'),
});
