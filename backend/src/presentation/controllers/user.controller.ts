import { NextFunction, Request, Response } from 'express';

import { GetCurrentUserUseCase } from '../../application/use-cases/users/get-current-user.use-case.js';
import { UpdateCurrentUserUseCase } from '../../application/use-cases/users/update-current-user.use-case.js';
import { ChangePasswordUseCase } from '../../application/use-cases/users/change-password.use-case.js';
import { PrismaUserRepository } from '../../infrastructure/repositories/prisma-user.repository.js';
import { UserResponseMapper } from '../mappers/user-response.mapper.js';
import { DeactivateUserUseCase } from '../../application/use-cases/users/deactivate-user.use-case.js';

export class UserController {
  private readonly userRepository = new PrismaUserRepository();

  private readonly updateCurrentUserUseCase = new UpdateCurrentUserUseCase(this.userRepository);

  private readonly changePasswordUseCase = new ChangePasswordUseCase(this.userRepository);

  private readonly deactivateUserUseCase = new DeactivateUserUseCase(this.userRepository);

  constructor(private readonly getCurrentUserUseCase: GetCurrentUserUseCase) {}

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = this.getCurrentUserUseCase.execute(req.user);

      res.status(200).json({
        success: true,
        message: 'Current user retrieved successfully.',
        data: UserResponseMapper.toResponse(user),
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

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.changePasswordUseCase.execute(req.user, req.body);

      res.status(200).json({
        success: true,
        message: 'Password updated successfully.',
      });
    } catch (error) {
      next(error);
    }
  };

  deactivateAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deactivateUserUseCase.execute(req.user);

      res.status(200).json({
        success: true,
        message: 'Account deactivated successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}
