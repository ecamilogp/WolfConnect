import path from 'node:path';

import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  UPLOADS_ROOT,
  resolveAttachmentFolder,
} from '../../config/attachment.config.js';
import { createUploadMiddleware } from './upload.factory.js';

export const uploadSingleAttachment = createUploadMiddleware({
  fieldName: 'file',
  allowedMimeTypes: ALLOWED_ATTACHMENT_MIME_TYPES,
  maxSizeBytes: MAX_ATTACHMENT_SIZE_BYTES,
  resolveDestination: (file) => path.join(UPLOADS_ROOT, resolveAttachmentFolder(file.mimetype)),
  buildTypeErrorMessage: (mimetype) => `File type "${mimetype}" is not allowed.`,
  buildSizeErrorMessage: (maxMb) => `File exceeds the maximum allowed size of ${maxMb}MB.`,
});
