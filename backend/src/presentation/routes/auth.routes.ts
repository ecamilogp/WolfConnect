import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller.js';
import { RegisterUserUseCase } from '../../application/use-cases/auth/register-user.use-case.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository.js';
import { validate } from '../middlewares/validation.middleware.js';
import { registerUserSchema } from '../../application/validators/auth/register-user.schema.js';

const router = Router();

// Dependencias
const userRepository = new PrismaUserRepository();
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const authController = new AuthController(registerUserUseCase);

// Rutas
router.post('/register', validate(registerUserSchema), authController.register);

export default router;
