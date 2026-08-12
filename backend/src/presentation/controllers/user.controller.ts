import fs from 'node:fs';
import path from 'node:path';

import { NextFunction, Request, Response } from 'express';

import { GetCurrentUserUseCase } from '../../application/use-cases/users/get-current-user.use-case.js';
import { UpdateCurrentUserUseCase } from '../../application/use-cases/users/update-current-user.use-case.js';
import { ChangePasswordUseCase } from '../../application/use-cases/users/change-password.use-case.js';
import { UserResponseMapper } from '../mappers/user-response.mapper.js';
import { DeactivateUserUseCase } from '../../application/use-cases/users/deactivate-user.use-case.js';
import { AdminDeactivateUserUseCase } from '../../application/use-cases/users/admin-deactivate-user.use-case.js';
import { SearchUsersUseCase } from '../../application/use-cases/users/search-users.use-case.js';
import { AVATAR_PUBLIC_PATH_PREFIX, AVATAR_UPLOADS_DIR } from '../../config/avatar.config.js';
import { BadRequestError } from '../../shared/errors/bad-request-error.js';

function deleteLocalAvatarFile(profileImage: string | null): void {
  if (!profileImage || !profileImage.startsWith(AVATAR_PUBLIC_PATH_PREFIX)) {
    return;
  }

  const fileName = path.basename(profileImage);
  const filePath = path.join(AVATAR_UPLOADS_DIR, fileName);

  fs.unlink(filePath, (error) => {
    if (error) {
      console.error('[user:avatar-cleanup-failed]', error);
    }
  });
}

export class UserController {
  constructor(
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateCurrentUserUseCase: UpdateCurrentUserUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly adminDeactivateUserUseCase: AdminDeactivateUserUseCase,
    private readonly searchUsersUseCase: SearchUsersUseCase,
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

      deleteLocalAvatarFile(previousProfileImage);

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
      await this.adminDeactivateUserUseCase.execute(req.user, String(req.params.userId));

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully.',
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
