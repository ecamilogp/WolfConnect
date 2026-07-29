import { CreateMessageDto } from '../dto/message/create-message.dto.js';
import { MessageResponseDto } from '../dto/message/message-response.dto.js';

export interface MessageRepository {
  create(data: CreateMessageDto): Promise<MessageResponseDto>;
}
