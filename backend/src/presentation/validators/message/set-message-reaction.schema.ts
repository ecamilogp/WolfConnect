import { z } from 'zod';

export const setMessageReactionSchema = z.object({
  emoji: z.string().trim().min(1, 'Emoji is required.').max(8, 'Emoji is not valid.'),
});
