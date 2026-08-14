import {
  ALLOWED_GROUP_PHOTO_MIME_TYPES,
  GROUP_PHOTO_UPLOADS_DIR,
  MAX_GROUP_PHOTO_SIZE_BYTES,
} from '../../config/group-photo.config.js';
import { createUploadMiddleware } from './upload.factory.js';

export const uploadSingleGroupPhoto = createUploadMiddleware({
  fieldName: 'photo',
  allowedMimeTypes: ALLOWED_GROUP_PHOTO_MIME_TYPES,
  maxSizeBytes: MAX_GROUP_PHOTO_SIZE_BYTES,
  resolveDestination: () => GROUP_PHOTO_UPLOADS_DIR,
  buildTypeErrorMessage: (mimetype) => `File type "${mimetype}" is not allowed for group photos.`,
  buildSizeErrorMessage: (maxMb) => `Image exceeds the maximum allowed size of ${maxMb}MB.`,
});
