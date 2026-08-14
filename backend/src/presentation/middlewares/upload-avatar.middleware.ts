import {
  ALLOWED_AVATAR_MIME_TYPES,
  AVATAR_UPLOADS_DIR,
  MAX_AVATAR_SIZE_BYTES,
} from '../../config/avatar.config.js';
import { createUploadMiddleware } from './upload.factory.js';

export const uploadSingleAvatar = createUploadMiddleware({
  fieldName: 'avatar',
  allowedMimeTypes: ALLOWED_AVATAR_MIME_TYPES,
  maxSizeBytes: MAX_AVATAR_SIZE_BYTES,
  resolveDestination: () => AVATAR_UPLOADS_DIR,
  buildTypeErrorMessage: (mimetype) => `File type "${mimetype}" is not allowed for avatars.`,
  buildSizeErrorMessage: (maxMb) => `Image exceeds the maximum allowed size of ${maxMb}MB.`,
});
