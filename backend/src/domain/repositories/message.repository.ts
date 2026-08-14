import { CreateMessageDto } from '../dto/message/create-message.dto.js';
import { DeleteMessageDto } from '../dto/message/delete-message.dto.js';
import { MessageListItemDto } from '../dto/message/message-list-item.dto.js';
import { MessageResponseDto } from '../dto/message/message-response.dto.js';
import { UpdateMessageDto } from '../dto/message/update-message.dto.js';
import { MarkMessagesAsReadDto } from '../dto/message/mark-messages-as-read.dto.js';

export interface MessageRepository {
  create(data: CreateMessageDto): Promise<MessageResponseDto>;

  findByChatId(chatId: string): Promise<MessageListItemDto[]>;

  findById(messageId: string): Promise<MessageResponseDto | null>;

  update(dto: UpdateMessageDto): Promise<MessageResponseDto>;

  delete(dto: DeleteMessageDto): Promise<void>;

  markAsRead(dto: MarkMessagesAsReadDto): Promise<string[]>;
}
