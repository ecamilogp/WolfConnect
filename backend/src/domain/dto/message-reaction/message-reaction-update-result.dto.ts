import { MessageReactionSummaryDto } from '../message/message-reaction-summary.dto.js';
import { MessageReactionResponseDto } from './message-reaction-response.dto.js';

export interface MessageReactionUpdateResultDto {
  chatId: string;
  messageId: string;
  reactions: MessageReactionSummaryDto[];
  reaction: MessageReactionResponseDto | null;
}
