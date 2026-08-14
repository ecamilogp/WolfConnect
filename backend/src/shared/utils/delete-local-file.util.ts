import fs from 'node:fs';
import path from 'node:path';

/**
 * Deletes a previously-uploaded local file if its URL was served under the
 * given public path prefix (avatars, group photos, etc). Shared by every
 * "replace this uploaded image" flow so cleanup logic isn't reimplemented
 * per feature.
 */
export function deleteLocalFileIfManaged(
  fileUrl: string | null | undefined,
  publicPathPrefix: string,
  uploadsDir: string,
  logTag: string,
): void {
  if (!fileUrl || !fileUrl.startsWith(publicPathPrefix)) {
    return;
  }

  const fileName = path.basename(fileUrl);
  const filePath = path.join(uploadsDir, fileName);

  fs.unlink(filePath, (error) => {
    if (error) {
      console.error(`[${logTag}:cleanup-failed]`, error);
    }
  });
}
