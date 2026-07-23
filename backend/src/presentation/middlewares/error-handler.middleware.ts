import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../shared/errors/app-error.js';
import { ValidationError } from '../../shared/errors/validation-error.js';

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error(error);

  if (error instanceof ValidationError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });

    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
}
