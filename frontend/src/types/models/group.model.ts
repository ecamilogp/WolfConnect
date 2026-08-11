import type { GroupJoinPolicy, ParticipantRole } from './chat.model'

export interface GroupParticipant {
  userId: string
  role: ParticipantRole
  joinedAt: string
  firstName: string
  lastName: string
  username: string
  profileImage: string | null
}

export interface GroupDetail {
  id: string
  type: 'GROUP'
  name: string | null
  description: string | null
  imageUrl: string | null
  joinPolicy: GroupJoinPolicy | null
  createdAt: string
  updatedAt: string
  participants: GroupParticipant[]
}

export interface PendingInvitation {
  id: string
  chatId: string
  groupName: string
  groupImageUrl: string | null
  invitedByUserId: string
  invitedByName: string
  createdAt: string
}
