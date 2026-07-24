import { NextFunction, Request, Response } from 'express';

import { GetCurrentUserUseCase } from '../../application/use-cases/users/get-current-user.use-case.js';
import { UserResponseMapper } from '../mappers/user-response.mapper.js';
import { UpdateCurrentUserUseCase } from '../../application/use-cases/users/update-current-user.use-case.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository.js';

export class UserController {
  constructor(private readonly getCurrentUserUseCase: GetCurrentUserUseCase) {}

  private readonly updateCurrentUserUseCase = new UpdateCurrentUserUseCase(
    new PrismaUserRepository(),
  );

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = this.getCurrentUserUseCase.execute(req.user);

      const response = UserResponseMapper.toResponse(user);

      res.status(200).json({
        success: true,
        message: 'Current user retrieved successfully.',
        data: response,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedUser = await this.updateCurrentUserUseCase.execute(req.user, req.body);

      res.status(200).json({
        success: true,
        message: 'User updated successfully.',
        data: UserResponseMapper.toResponse(updatedUser),
      });
    } catch (error) {
      next(error);
    }
  };
}
