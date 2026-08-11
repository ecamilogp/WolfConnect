import type { Attachment } from '@/types/models/attachment.model'
import type { ChatSummary, ParticipantRole } from '@/types/models/chat.model'
import type { GroupParticipant } from '@/types/models/group.model'
import type { MessageReactionSummary } from '@/types/models/message.model'

export interface ChatJoinedPayload {
  chat: ChatSummary
}

export interface ChatLeftPayload {
  chatId: string
}

export interface MessageDeletedPayload {
  messageId: string
  chatId: string
}

export interface AttachmentUploadedPayload {
  messageId: string
  chatId: string
  attachment: Attachment
}

export interface MessageReactionUpdatedPayload {
  messageId: string
  chatId: string
  reactions: MessageReactionSummary[]
}

export interface MessageReadUpdatedPayload {
  chatId: string
  messageIds: string[]
}

export interface GroupRoleChangedPayload {
  chatId: string
  userId: string
  role: ParticipantRole
}

export interface GroupParticipantAddedPayload {
  chatId: string
  participant: GroupParticipant
}

export interface GroupParticipantRemovedPayload {
  chatId: string
  userId: string
}

export interface GroupOwnershipTransferredPayload {
  chatId: string
  previousOwnerId: string
  newOwnerId: string
}

export interface AppErrorPayload {
  code: string
  message: string
}
