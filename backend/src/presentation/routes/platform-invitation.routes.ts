import { Router } from 'express';

import { authenticate } from '../middlewares/authenticate.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { PlatformInvitationController } from '../controllers/platform-invitation.controller.js';
import { inviteToPlatformSchema } from '../validators/platform-invitation/invite-to-platform.schema.js';

const router = Router();

const platformInvitationController = new PlatformInvitationController();

router.post(
  '/',
  authenticate,
  validate(inviteToPlatformSchema),
  platformInvitationController.invite,
);

export default router;
