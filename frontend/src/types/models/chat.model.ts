export type ChatType = 'PRIVATE' | 'GROUP'

export type GroupJoinPolicy = 'AUTO_ADD' | 'INVITATION_REQUIRED'

export type ParticipantRole = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface Chat {
  id: string
  type: ChatType
  name: string | null
  description: string | null
  imageUrl: string | null
  joinPolicy: GroupJoinPolicy | null
  lastMessageAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ChatSummary {
  id: string
  type: ChatType
  name: string
  imageUrl: string | null
  unreadCount: number
  otherUserId: string | null
}
