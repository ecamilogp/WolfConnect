import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type { NextFunction, Request, Response } from 'express';
import multer, { type FileFilterCallback } from 'multer';

import { BadRequestError } from '../../shared/errors/bad-request-error.js';

export interface UploadMiddlewareOptions {
  fieldName: string;
  allowedMimeTypes: string[];
  maxSizeBytes: number;
  resolveDestination: (file: Express.Multer.File) => string;
  buildTypeErrorMessage: (mimetype: string) => string;
  buildSizeErrorMessage: (maxMb: number) => string;
}

/**
 * Builds a single-file multer middleware from a small set of options,
 * shared by every upload flow (avatars, group photos, attachments) so the
 * disk-storage/error-handling boilerplate isn't reimplemented per entity.
 */
export function createUploadMiddleware(
  options: UploadMiddlewareOptions,
): (req: Request, res: Response, next: NextFunction) => void {
  const { fieldName, allowedMimeTypes, maxSizeBytes, resolveDestination, buildTypeErrorMessage, buildSizeErrorMessage } =
    options;

  const storage = multer.diskStorage({
    destination: (_req, file, callback) => {
      const destination = resolveDestination(file);

      fs.mkdirSync(destination, { recursive: true });

      callback(null, destination);
    },
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
    },
  });

  function fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new BadRequestError(buildTypeErrorMessage(file.mimetype)));
      return;
    }

    callback(null, true);
  }

  const multerUpload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSizeBytes,
    },
  });

  return function uploadSingle(req: Request, res: Response, next: NextFunction): void {
    multerUpload.single(fieldName)(req, res, (error: unknown) => {
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          const maxMb = maxSizeBytes / (1024 * 1024);
          next(new BadRequestError(buildSizeErrorMessage(maxMb)));
          return;
        }

        next(new BadRequestError(error.message));
        return;
      }

      if (error) {
        next(error);
        return;
      }

      next();
    });
  };
}
