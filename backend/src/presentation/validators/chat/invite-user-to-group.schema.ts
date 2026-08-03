import { z } from 'zod';

export const inviteUserToGroupSchema = z.object({
  invitedUserId: z.uuid(),
});
