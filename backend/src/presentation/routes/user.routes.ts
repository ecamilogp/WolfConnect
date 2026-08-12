import { Router } from 'express';

import { authenticate } from '../middlewares/authenticate.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { uploadSingleAvatar } from '../middlewares/upload-avatar.middleware.js';
import { UserController } from '../controllers/user.controller.js';
import { updateUserSchema } from '../validators/users/update-user.validator.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository.js';

import { GetCurrentUserUseCase } from '../../application/use-cases/users/get-current-user.use-case.js';
import { UpdateCurrentUserUseCase } from '../../application/use-cases/users/update-current-user.use-case.js';
import { ChangePasswordUseCase } from '../../application/use-cases/users/change-password.use-case.js';
import { DeactivateUserUseCase } from '../../application/use-cases/users/deactivate-user.use-case.js';
import { AdminDeactivateUserUseCase } from '../../application/use-cases/users/admin-deactivate-user.use-case.js';
import { SearchUsersUseCase } from '../../application/use-cases/users/search-users.use-case.js';
import { changePasswordSchema } from '../validators/users/change-password.validator.js';

const router = Router();

const userRepository = new PrismaUserRepository();
const getCurrentUserUseCase = new GetCurrentUserUseCase();
const updateCurrentUserUseCase = new UpdateCurrentUserUseCase(userRepository);
const changePasswordUseCase = new ChangePasswordUseCase(userRepository);
const deactivateUserUseCase = new DeactivateUserUseCase(userRepository);
const adminDeactivateUserUseCase = new AdminDeactivateUserUseCase(userRepository);
const searchUsersUseCase = new SearchUsersUseCase(userRepository);

const userController = new UserController(
  getCurrentUserUseCase,
  updateCurrentUserUseCase,
  changePasswordUseCase,
  deactivateUserUseCase,
  adminDeactivateUserUseCase,
  searchUsersUseCase,
);

router.get('/me', authenticate, userController.me);

router.get('/search', authenticate, userController.search);

router.patch('/me', authenticate, validate(updateUserSchema), userController.update);

router.patch('/me/avatar', authenticate, uploadSingleAvatar, userController.uploadAvatar);

router.patch(
  '/me/password',
  authenticate,
  validate(changePasswordSchema),
  userController.changePassword,
);

router.patch('/me/deactivate', authenticate, userController.deactivateAccount);

router.patch('/:userId/deactivate', authenticate, userController.adminDeactivateUser);

export default router;
