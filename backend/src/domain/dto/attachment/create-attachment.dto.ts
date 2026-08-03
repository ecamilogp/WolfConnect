export interface CreateAttachmentDto {
  messageId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}
