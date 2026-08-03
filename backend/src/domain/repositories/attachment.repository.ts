import { AttachmentResponseDto } from '../dto/attachment/attachment-response.dto.js';
import { CreateAttachmentDto } from '../dto/attachment/create-attachment.dto.js';

export interface AttachmentRepository {
  create(data: CreateAttachmentDto): Promise<AttachmentResponseDto>;
}
