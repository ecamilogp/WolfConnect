import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import type { NextFunction, Request, Response } from 'express';
import multer, { type FileFilterCallback } from 'multer';

import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  resolveAttachmentFolder,
} from '../../config/attachment.config.js';
import { BadRequestError } from '../../shared/errors/bad-request-error.js';

const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (_req, file, callback) => {
    const destination = path.join(UPLOADS_ROOT, resolveAttachmentFolder(file.mimetype));

    // Local storage MVP: se asegura que la carpeta exista antes de escribir.
    // El día que esto se reemplace por S3/Cloudinary, este archivo es el
    // único que cambia -- el resto del módulo no sabe que el disco existe.
    fs.mkdirSync(destination, { recursive: true });

    callback(null, destination);
  },
  filename: (_req, file, callback) => {
    callback(null, `${randomUUID()}${path.extname(file.originalname)}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void {
  if (!ALLOWED_ATTACHMENT_MIME_TYPES.includes(file.mimetype)) {
    callback(new BadRequestError(`File type "${file.mimetype}" is not allowed.`));
    return;
  }

  callback(null, true);
}

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_ATTACHMENT_SIZE_BYTES,
  },
});

/**
 * Envuelve `multer.single('file')` para traducir sus errores (tamaño
 * excedido, tipo rechazado) al mismo formato que usa el resto de la API
 * (`AppError` -> `errorHandler`), sin tocar `errorHandler.middleware.ts`.
 */
export function uploadSingleAttachment(req: Request, res: Response, next: NextFunction): void {
  multerUpload.single('file')(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        const maxMb = MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024);
        next(new BadRequestError(`File exceeds the maximum allowed size of ${maxMb}MB.`));
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
