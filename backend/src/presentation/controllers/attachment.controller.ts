import { NextFunction, Request, Response } from 'express';

import { UploadAttachmentUseCase } from '../../application/use-cases/attachment/upload-attachment.use-case.js';
import { SocketEvents } from '../../infrastructure/websocket/events/socket-events.enum.js';
import { chatRoom } from '../../infrastructure/websocket/handlers/chat.handler.js';
import { AttachmentUploadedPayload } from '../../infrastructure/websocket/types/socket-payloads.type.js';
import { PrismaAttachmentRepository } from '../../infrastructure/repositories/prisma-attachment.repository.js';
import { PrismaMessageRepository } from '../../infrastructure/repositories/prisma-message.repository.js';
import { BadRequestError } from '../../shared/errors/bad-request-error.js';
import { safeEmit } from '../../shared/utils/safe-emit.util.js';

export class AttachmentController {
  private readonly messageRepository = new PrismaMessageRepository();

  private readonly attachmentRepository = new PrismaAttachmentRepository();

  private readonly uploadAttachmentUseCase = new UploadAttachmentUseCase(
    this.messageRepository,
    this.attachmentRepository,
  );

  uploadAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestError('A file is required.');
      }

      const { attachment, chatId } = await this.uploadAttachmentUseCase.execute({
        messageId: String(req.params.messageId),
        userId: req.user.id,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      });

      const payload: AttachmentUploadedPayload = { messageId: attachment.messageId, chatId, attachment };

      safeEmit(chatRoom(chatId), SocketEvents.ATTACHMENT_UPLOADED, payload, 'attachment');

      res.status(201).json({
        success: true,
        message: 'Attachment uploaded successfully.',
        data: attachment,
      });
    } catch (error) {
      next(error);
    }
  };
}
