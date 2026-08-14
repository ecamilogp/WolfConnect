export interface CreateMessageDto {
  chatId: string;
  senderId: string;
  content: string | null;
  replyToMessageId?: string;
}
