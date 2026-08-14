import type { Attachment } from './attachment.model'

export type MessageType = 'TEXT' | 'SYSTEM'

export type SystemEventType = 'PARTICIPANT_LEFT' | 'PARTICIPANT_REMOVED' | 'PARTICIPANT_JOINED'

export interface MessageSenderSummary {
  id: string
  firstName: string
  lastName: string
  profileImage: string | null
}

export interface ReplyToMessage {
  id: string
  senderId: string | null
  senderName: string | null
  content: string | null
  type: MessageType
}

export interface MessageReactionSummary {
  userId: string
  emoji: string
}

export interface Message {
  id: string
  chatId: string
  senderId: string | null
  sender: MessageSenderSummary | null
  content: string | null
  type: MessageType
  systemEventType: SystemEventType | null
  systemEventPayload: Record<string, unknown> | null
  isReadByAll: boolean
  createdAt: string
  editedAt: string | null
  deletedAt: string | null
  replyTo: ReplyToMessage | null
  reactions: MessageReactionSummary[]
  attachments: Attachment[]
}

export interface MessageListItem {
  id: string
  senderId: string | null
  sender: MessageSenderSummary | null
  content: string | null
  type: MessageType
  systemEventType: SystemEventType | null
  systemEventPayload: Record<string, unknown> | null
  isReadByAll: boolean
  createdAt: string
  editedAt: string | null
  replyTo: ReplyToMessage | null
  reactions: MessageReactionSummary[]
  attachments: Attachment[]
}
