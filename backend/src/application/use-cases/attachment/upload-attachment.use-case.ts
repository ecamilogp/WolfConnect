import { AttachmentResponseDto } from '../../../domain/dto/attachment/attachment-response.dto.js';
import { UploadAttachmentDto } from '../../../domain/dto/attachment/upload-attachment.dto.js';
import { AttachmentRepository } from '../../../domain/repositories/attachment.repository.js';
import { MessageRepository } from '../../../domain/repositories/message.repository.js';
import { ForbiddenError } from '../../../shared/errors/forbidden-error.js';
import { NotFoundError } from '../../../shared/errors/not-found-error.js';

export interface UploadAttachmentResult {
  attachment: AttachmentResponseDto;
  chatId: string;
}

export class UploadAttachmentUseCase {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly attachmentRepository: AttachmentRepository,
  ) {}

  async execute(dto: UploadAttachmentDto): Promise<UploadAttachmentResult> {
    const message = await this.messageRepository.findById(dto.messageId);

    if (!message || message.deletedAt) {
      throw new NotFoundError('Message not found.');
    }

    if (message.senderId !== dto.userId) {
      throw new ForbiddenError('You can only attach files to your own messages.');
    }

    const attachment = await this.attachmentRepository.create({
      messageId: dto.messageId,
      fileName: dto.fileName,
      originalName: dto.originalName,
      mimeType: dto.mimeType,
      size: dto.size,
      path: dto.path,
    });

    return { attachment, chatId: message.chatId };
  }
}
