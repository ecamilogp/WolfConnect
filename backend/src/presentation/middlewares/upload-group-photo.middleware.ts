import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type { NextFunction, Request, Response } from 'express';
import multer, { type FileFilterCallback } from 'multer';

import {
  ALLOWED_GROUP_PHOTO_MIME_TYPES,
  GROUP_PHOTO_UPLOADS_DIR,
  MAX_GROUP_PHOTO_SIZE_BYTES,
} from '../../config/group-photo.config.js';
import { BadRequestError } from '../../shared/errors/bad-request-error.js';

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdirSync(GROUP_PHOTO_UPLOADS_DIR, { recursive: true });

    callback(null, GROUP_PHOTO_UPLOADS_DIR);
  },
  filename: (_req, file, callback) => {
    callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void {
  if (!ALLOWED_GROUP_PHOTO_MIME_TYPES.includes(file.mimetype)) {
    callback(new BadRequestError(`File type "${file.mimetype}" is not allowed for group photos.`));
    return;
  }

  callback(null, true);
}

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_GROUP_PHOTO_SIZE_BYTES,
  },
});

export function uploadSingleGroupPhoto(req: Request, res: Response, next: NextFunction): void {
  multerUpload.single('photo')(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        const maxMb = MAX_GROUP_PHOTO_SIZE_BYTES / (1024 * 1024);
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
