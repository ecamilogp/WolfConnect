export type PlatformInvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'

export interface PlatformInvitation {
  id: string
  email: string
  status: PlatformInvitationStatus
  invitedByUserId: string
  expiresAt: string
  acceptedAt: string | null
  createdAt: string
}
