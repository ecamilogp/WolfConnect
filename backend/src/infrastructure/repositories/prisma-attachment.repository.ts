import { AttachmentResponseDto } from '../../domain/dto/attachment/attachment-response.dto.js';
import { CreateAttachmentDto } from '../../domain/dto/attachment/create-attachment.dto.js';
import { AttachmentRepository } from '../../domain/repositories/attachment.repository.js';
import { prisma } from '../database/prisma.service.js';

export class PrismaAttachmentRepository implements AttachmentRepository {
  async create(data: CreateAttachmentDto): Promise<AttachmentResponseDto> {
    const attachment = await prisma.attachment.create({
      data: {
        messageId: data.messageId,
        fileName: data.fileName,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        path: data.path,
      },
    });

    return {
      id: attachment.id,
      messageId: attachment.messageId,
      fileName: attachment.fileName,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      path: attachment.path,
      createdAt: attachment.createdAt,
    };
  }
}
