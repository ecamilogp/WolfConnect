import { Request, Response, NextFunction } from 'express';

import { RegisterUserUseCase } from '../../application/use-cases/auth/register-user.use-case.js';
import { UserResponseMapper } from '../mappers/user-response.mapper.js';

export class AuthController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

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
}
