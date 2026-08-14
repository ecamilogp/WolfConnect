import { NextFunction, Request, Response } from 'express';

import { GetCurrentUserUseCase } from '../../application/use-cases/users/get-current-user.use-case.js';
import { UpdateCurrentUserUseCase } from '../../application/use-cases/users/update-current-user.use-case.js';
import { ChangePasswordUseCase } from '../../application/use-cases/users/change-password.use-case.js';
import { UserResponseMapper } from '../mappers/user-response.mapper.js';
import { DeactivateUserUseCase } from '../../application/use-cases/users/deactivate-user.use-case.js';
import { AdminDeactivateUserUseCase } from '../../application/use-cases/users/admin-deactivate-user.use-case.js';
import { SearchUsersUseCase } from '../../application/use-cases/users/search-users.use-case.js';
import { ListUsersUseCase } from '../../application/use-cases/users/list-users.use-case.js';
import { UpdateUserRoleUseCase } from '../../application/use-cases/users/update-user-role.use-case.js';
import { AdminBlockUserUseCase } from '../../application/use-cases/users/admin-block-user.use-case.js';
import { AdminReactivateUserUseCase } from '../../application/use-cases/users/admin-reactivate-user.use-case.js';
import { AVATAR_PUBLIC_PATH_PREFIX, AVATAR_UPLOADS_DIR } from '../../config/avatar.config.js';
import { BadRequestError } from '../../shared/errors/bad-request-error.js';
import { deleteLocalFileIfManaged } from '../../shared/utils/delete-local-file.util.js';

export class UserController {
  constructor(
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateCurrentUserUseCase: UpdateCurrentUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly adminDeactivateUserUseCase: AdminDeactivateUserUseCase,
    private readonly searchUsersUseCase: SearchUsersUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
    private readonly adminBlockUserUseCase: AdminBlockUserUseCase,
    private readonly adminReactivateUserUseCase: AdminReactivateUserUseCase,
  ) {}

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

  uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestError('An image file is required.');
      }

      const previousProfileImage = req.user.profileImage;
      const profileImage = `${AVATAR_PUBLIC_PATH_PREFIX}/${req.file.filename}`;

      const updatedUser = await this.updateCurrentUserUseCase.execute(req.user, { profileImage });

      deleteLocalFileIfManaged(
        previousProfileImage,
        AVATAR_PUBLIC_PATH_PREFIX,
        AVATAR_UPLOADS_DIR,
        'user:avatar',
      );

      res.status(200).json({
        success: true,
        message: 'Avatar updated successfully.',
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

  adminDeactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedUser = await this.adminDeactivateUserUseCase.execute(
        req.user,
        String(req.params.userId),
      );

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully.',
        data: UserResponseMapper.toResponse(updatedUser),
      });
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedUser = await this.adminBlockUserUseCase.execute(
        req.user,
        String(req.params.userId),
      );

      res.status(200).json({
        success: true,
        message: 'User blocked successfully.',
        data: UserResponseMapper.toResponse(updatedUser),
      });
    } catch (error) {
      next(error);
    }
  };

  reactivateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedUser = await this.adminReactivateUserUseCase.execute(
        req.user,
        String(req.params.userId),
      );

      res.status(200).json({
        success: true,
        message: 'User reactivated successfully.',
        data: UserResponseMapper.toResponse(updatedUser),
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.listUsersUseCase.execute(req.user);

      res.status(200).json({
        success: true,
        data: users.map(UserResponseMapper.toResponse),
      });
    } catch (error) {
      next(error);
    }
  };

  updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updatedUser = await this.updateUserRoleUseCase.execute(
        req.user,
        String(req.params.userId),
        req.body,
      );

      res.status(200).json({
        success: true,
        message: 'User role updated successfully.',
        data: UserResponseMapper.toResponse(updatedUser),
      });
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';

      if (query.length === 0) {
        res.status(200).json({
          success: true,
          data: [],
        });
        return;
      }

      const users = await this.searchUsersUseCase.execute(query, req.user.id);

      res.status(200).json({
        success: true,
        data: users.map(UserResponseMapper.toSearchResult),
      });
    } catch (error) {
      next(error);
    }
  };
}
