export interface AttachmentResponseDto {
  id: string;
  messageId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  createdAt: Date;
}
