import type { Chat, ChatSummary } from '@/types/models/chat.model'
import type { Message } from '@/types/models/message.model'
import type { Notification } from '@/types/models/notification.model'

import type {
  AppErrorPayload,
  AttachmentUploadedPayload,
  ChatJoinedPayload,
  ChatLeftPayload,
  GroupOwnershipTransferredPayload,
  GroupParticipantRemovedPayload,
  GroupRoleChangedPayload,
  MessageDeletedPayload,
  MessageReactionUpdatedPayload,
} from './payloads.type'

export interface ServerToClientEvents {
  'presence:online': (payload: { userId: string }) => void
  'presence:offline': (payload: { userId: string }) => void
  'chat:joined': (payload: ChatJoinedPayload) => void
  'chat:left': (payload: ChatLeftPayload) => void
  'chat:new': (payload: ChatSummary) => void
  'message:new': (payload: Message) => void
  'message:edited': (payload: Message) => void
  'message:deleted': (payload: MessageDeletedPayload) => void
  'message:reaction:updated': (payload: MessageReactionUpdatedPayload) => void
  'attachment:uploaded': (payload: AttachmentUploadedPayload) => void
  'group:updated': (payload: Chat) => void
  'group:role:changed': (payload: GroupRoleChangedPayload) => void
  'group:participant:removed': (payload: GroupParticipantRemovedPayload) => void
  'group:ownership:transferred': (payload: GroupOwnershipTransferredPayload) => void
  'notification:new': (payload: Notification) => void
  'app:error': (payload: AppErrorPayload) => void
}

export interface ClientToServerEvents {
  'chat:join': (payload: { chatId: string }) => void
  'chat:leave': (payload: { chatId: string }) => void
  'message:send': (payload: { chatId: string; content: string; replyToMessageId?: string }) => void
  'message:edit': (payload: { messageId: string; content: string }) => void
  'message:delete': (payload: { messageId: string }) => void
}
