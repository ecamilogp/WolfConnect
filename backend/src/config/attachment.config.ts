export const MAX_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export type AttachmentFolder = 'images' | 'videos' | 'documents' | 'others';

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
];

const ARCHIVE_MIME_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'application/x-7z-compressed',
  'application/gzip',
  'application/x-tar',
];

// Whitelist consumida por el middleware de Multer: cualquier mimeType fuera
// de esta lista se rechaza antes de tocar el filesystem.
export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  ...IMAGE_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
  ...DOCUMENT_MIME_TYPES,
  ...ARCHIVE_MIME_TYPES,
];

/**
 * Decide en cuál de las 4 carpetas de `uploads/` cae un archivo, a partir de
 * su mimeType. Los comprimidos (zip/rar/7z/tar/gzip) caen en "others" -- el
 * spec del módulo solo pidió 4 carpetas, no una quinta para archivos comprimidos.
 */
export function resolveAttachmentFolder(mimeType: string): AttachmentFolder {
  if (IMAGE_MIME_TYPES.includes(mimeType)) {
    return 'images';
  }

  if (VIDEO_MIME_TYPES.includes(mimeType)) {
    return 'videos';
  }

  if (DOCUMENT_MIME_TYPES.includes(mimeType)) {
    return 'documents';
  }

  return 'others';
}
