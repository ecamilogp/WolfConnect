import { Attachment as PrismaAttachment } from '@prisma/client';

import { buildAttachmentUrl } from '../../config/attachment.config.js';
import { AttachmentResponseDto } from '../../domain/dto/attachment/attachment-response.dto.js';

export class AttachmentMapper {
  static toResponseDto(attachment: PrismaAttachment): AttachmentResponseDto {
    return {
      id: attachment.id,
      messageId: attachment.messageId,
      fileName: attachment.fileName,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      path: attachment.path,
      url: buildAttachmentUrl(attachment.mimeType, attachment.fileName),
      createdAt: attachment.createdAt,
    };
  }
}
