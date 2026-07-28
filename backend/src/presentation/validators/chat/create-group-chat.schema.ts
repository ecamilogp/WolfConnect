import { z } from 'zod';

export const createGroupChatSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Group name must be at least 3 characters long.' })
    .max(100, { message: 'Group name must not exceed 100 characters.' }),

  description: z
    .string()
    .trim()
    .max(255, { message: 'Description must not exceed 255 characters.' })
    .optional(),

  imageUrl: z.url({ message: 'Image URL must be a valid URL.' }).optional(),

  joinPolicy: z.enum(['AUTO_ADD', 'INVITATION_REQUIRED'], {
    message: 'Join policy must be AUTO_ADD or INVITATION_REQUIRED.',
  }),
});
