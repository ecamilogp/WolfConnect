import { Router } from 'express';

import { authenticate } from '../middlewares/authenticate.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { UserController } from '../controllers/user.controller.js';
import { updateUserSchema } from '../validators/users/update-user.validator.js';

import { GetCurrentUserUseCase } from '../../application/use-cases/users/get-current-user.use-case.js';
import { changePasswordSchema } from '../validators/users/change-password.validator.js';

const router = Router();

const getCurrentUserUseCase = new GetCurrentUserUseCase();

const userController = new UserController(getCurrentUserUseCase);

router.get('/me', authenticate, userController.me);

router.patch('/me', authenticate, validate(updateUserSchema), userController.update);

router.patch(
  '/me/password',
  authenticate,
  validate(changePasswordSchema),
  userController.changePassword,
);

router.patch('/me/deactivate', authenticate, userController.deactivateAccount);

export default router;
