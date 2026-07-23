import { Request, Response, NextFunction } from 'express';

import { RegisterUserUseCase } from '../../application/use-cases/auth/register-user.use-case.js';
import { UserResponseMapper } from '../mappers/user-response.mapper.js';
import { LoginUserUseCase } from '../../application/use-cases/auth/login-user.use-case.js';
import { AuthResponseMapper } from '../mappers/auth-response.mapper.js';

export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.registerUserUseCase.execute(req.body);

      const response = UserResponseMapper.toResponse(user);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, accessToken } = await this.loginUserUseCase.execute(req.body);

      const response = AuthResponseMapper.toResponse(user, accessToken);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };
}
