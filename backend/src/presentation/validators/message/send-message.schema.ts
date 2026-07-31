import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, 'Content is required.').max(5000, 'Message is too long.'),
  replyToMessageId: z.uuid({ message: 'replyToMessageId must be a valid UUID.' }).optional(),
});
