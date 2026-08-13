export interface SendMessageWithAttachmentDto {
  chatId: string;
  senderId: string;
  content: string | null;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}
