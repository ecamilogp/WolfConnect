import { z } from 'zod';

export const createPrivateChatSchema = z.object({
  targetUserId: z.string().pipe(z.uuid({ message: 'Target user ID must be a valid UUID.' })),
});
