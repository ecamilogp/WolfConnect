import { NextFunction, Request, Response } from 'express';

import { UserRole } from '../../domain/entities/user.entity.js';
import { ForbiddenError } from '../../shared/errors/forbidden-error.js';

/**
 * Route-level guard for platform administrator-only endpoints.
 *
 * This is intentionally separate from any per-use-case role check: relying
 * on a single check buried inside one use case is fragile (easy to forget
 * on the next admin endpoint). This middleware gives every admin-only route
 * a guard at the routing layer, in addition to whatever the use case does.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user.role !== UserRole.ADMIN) {
    next(new ForbiddenError('Only an administrator can perform this action.'));
    return;
  }

  next();
}
