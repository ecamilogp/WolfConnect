import { MessageReactionResponseDto } from '../dto/message-reaction/message-reaction-response.dto.js';
import { RemoveMessageReactionDto } from '../dto/message-reaction/remove-message-reaction.dto.js';
import { SetMessageReactionDto } from '../dto/message-reaction/set-message-reaction.dto.js';

export interface MessageReactionRepository {
  upsert(dto: SetMessageReactionDto): Promise<MessageReactionResponseDto>;

  remove(dto: RemoveMessageReactionDto): Promise<void>;
}
