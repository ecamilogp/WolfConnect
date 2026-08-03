import { z } from 'zod';

export const updateGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'Group name must be at least 3 characters long.' })
    .max(100, { message: 'Group name must not exceed 100 characters.' })
    .optional(),

  description: z
    .string()
    .trim()
    .max(255, { message: 'Description must not exceed 255 characters.' })
    .optional(),

  imageUrl: z.url({ message: 'Image URL must be a valid URL.' }).optional(),
});
