import path from 'node:path';

import { UPLOADS_ROOT } from './attachment.config.js';

export const MAX_GROUP_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

export const GROUP_PHOTO_UPLOADS_DIR = path.join(UPLOADS_ROOT, 'group-photos');

export const ALLOWED_GROUP_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const GROUP_PHOTO_PUBLIC_PATH_PREFIX = '/uploads/group-photos';
