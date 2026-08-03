export type MessageType = 'TEXT' | 'SYSTEM'

export interface ReplyToMessage {
  id: string
  senderId: string
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
  senderId: string
  content: string | null
  type: MessageType
  createdAt: string
  editedAt: string | null
  deletedAt: string | null
  replyTo: ReplyToMessage | null
  reactions: MessageReactionSummary[]
}

export interface MessageListItem {
  id: string
  senderId: string
  content: string | null
  type: MessageType
  createdAt: string
  editedAt: string | null
  replyTo: ReplyToMessage | null
  reactions: MessageReactionSummary[]
}
