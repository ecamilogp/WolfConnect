import { httpClient } from './http-client'
import type { PlatformInvitation } from '@/types/models/platform-invitation.model'

export async function createPlatformInvitation(email: string): Promise<PlatformInvitation> {
  const response = await httpClient.post<PlatformInvitation>('/platform-invitations', { email })
  return response.data
}
