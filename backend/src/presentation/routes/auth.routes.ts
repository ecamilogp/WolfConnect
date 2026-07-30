import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller.js';
import { RegisterUserUseCase } from '../../application/use-cases/auth/register-user.use-case.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository.js';
import { PrismaPlatformInvitationRepository } from '../../infrastructure/repositories/prisma-platform-invitation.repository.js';
import { validate } from '../middlewares/validation.middleware.js';
import { registerUserSchema } from '../validators/auth/register-user.schema.js';
import { LoginUserUseCase } from '../../application/use-cases/auth/login-user.use-case.js';
import { loginUserSchema } from '../validators/auth/login-user.schema.js';

const router = Router();

// Dependencias
const userRepository = new PrismaUserRepository();
const platformInvitationRepository = new PrismaPlatformInvitationRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository, platformInvitationRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository);
const authController = new AuthController(registerUserUseCase, loginUserUseCase);

// Rutas
router.post('/register', validate(registerUserSchema), authController.register);
router.post('/login', validate(loginUserSchema), authController.login);

export default router;
