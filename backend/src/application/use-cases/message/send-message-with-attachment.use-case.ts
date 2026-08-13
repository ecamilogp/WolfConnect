import { AttachmentRepository } from '../../../domain/repositories/attachment.repository.js';
import { ChatRepository } from '../../../domain/repositories/chat.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { MessageResponseDto } from '../../../domain/dto/message/message-response.dto.js';
import { SendMessageWithAttachmentDto } from '../../../domain/dto/message/send-message-with-attachment.dto.js';
import { requireActiveChat, requireChatParticipant } from './message.guards.js';

export class SendMessageWithAttachmentUseCase {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
    private readonly attachmentRepository: AttachmentRepository,
  ) {}

  async execute(dto: SendMessageWithAttachmentDto): Promise<MessageResponseDto> {
    await requireActiveChat(this.chatRepository, dto.chatId);

    await requireChatParticipant(this.chatRepository, dto.chatId, dto.senderId, {
      checkLeft: false,
    });

    const message = await this.messageRepository.create({
      chatId: dto.chatId,
      senderId: dto.senderId,
      content: dto.content,
    });

    try {
      const attachment = await this.attachmentRepository.create({
        messageId: message.id,
        fileName: dto.fileName,
        originalName: dto.originalName,
        mimeType: dto.mimeType,
        size: dto.size,
        path: dto.path,
      });

      return { ...message, attachments: [attachment] };
    } catch (error) {
      // The message was already persisted — if the attachment fails to save, don't
      // leave behind an empty, caption-less "ghost" message with nothing to show.
      await this.messageRepository.delete({ messageId: message.id, userId: dto.senderId });
      throw error;
    }
  }
}
