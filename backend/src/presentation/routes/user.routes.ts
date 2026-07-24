import { Router } from 'express';

import { authenticate } from '../middlewares/authenticate.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { UserController } from '../controllers/user.controller.js';
import { updateUserSchema } from '../validators/users/update-user.validator.js';

import { GetCurrentUserUseCase } from '../../application/use-cases/users/get-current-user.use-case.js';

const router = Router();

const getCurrentUserUseCase = new GetCurrentUserUseCase();

const userController = new UserController(getCurrentUserUseCase);

router.get('/me', authenticate, userController.me);

router.patch('/me', authenticate, validate(updateUserSchema), userController.update);

export default router;
