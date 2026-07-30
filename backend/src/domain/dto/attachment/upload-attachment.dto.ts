export interface UploadAttachmentDto {
  messageId: string;
  userId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}
