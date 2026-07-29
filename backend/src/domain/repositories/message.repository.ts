import { CreateMessageDto } from '../dto/message/create-message.dto.js';
import { MessageListItemDto } from '../dto/message/message-list-item.dto.js';
import { MessageResponseDto } from '../dto/message/message-response.dto.js';
import { UpdateMessageResponseDto } from '../dto/message/update-message-response.dto.js';
import { UpdateMessageDto } from '../dto/message/update-message.dto.js';

export interface MessageRepository {
  create(data: CreateMessageDto): Promise<MessageResponseDto>;

  findByChatId(chatId: string): Promise<MessageListItemDto[]>;

  findById(messageId: string): Promise<MessageResponseDto | null>;

  update(dto: UpdateMessageDto): Promise<UpdateMessageResponseDto>;
}
