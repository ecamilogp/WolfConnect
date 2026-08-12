import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type { NextFunction, Request, Response } from 'express';
import multer, { type FileFilterCallback } from 'multer';

import {
  ALLOWED_AVATAR_MIME_TYPES,
  AVATAR_UPLOADS_DIR,
  MAX_AVATAR_SIZE_BYTES,
} from '../../config/avatar.config.js';
import { BadRequestError } from '../../shared/errors/bad-request-error.js';

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdirSync(AVATAR_UPLOADS_DIR, { recursive: true });

    callback(null, AVATAR_UPLOADS_DIR);
  },
  filename: (_req, file, callback) => {
    callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void {
  if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.mimetype)) {
    callback(new BadRequestError(`File type "${file.mimetype}" is not allowed for avatars.`));
    return;
  }

  callback(null, true);
}

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_AVATAR_SIZE_BYTES,
  },
});

export function uploadSingleAvatar(req: Request, res: Response, next: NextFunction): void {
  multerUpload.single('avatar')(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        const maxMb = MAX_AVATAR_SIZE_BYTES / (1024 * 1024);
        next(new BadRequestError(`Image exceeds the maximum allowed size of ${maxMb}MB.`));
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
}
