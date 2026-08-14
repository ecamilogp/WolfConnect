import { httpClient } from './http-client'
import type { Chat, GroupJoinPolicy } from '@/types/models/chat.model'
import type { GroupDetail, PendingInvitation } from '@/types/models/group.model'

export interface CreateGroupPayload {
  name: string
  description?: string
  imageUrl?: string
  joinPolicy: GroupJoinPolicy
}

export interface UpdateGroupPayload {
  name?: string
  description?: string
  imageUrl?: string
}

export async function createGroup(payload: CreateGroupPayload): Promise<Chat> {
  const response = await httpClient.post<Chat>('/chats/groups', payload)
  return response.data
}

export async function updateGroup(chatId: string, payload: UpdateGroupPayload): Promise<Chat> {
  const response = await httpClient.patch<Chat>(`/chats/groups/${chatId}`, payload)
  return response.data
}

export async function uploadGroupPhoto(chatId: string, file: File): Promise<Chat> {
  // Axios sets the multipart/form-data Content-Type (with the correct
  // boundary) automatically when the request body is a FormData instance.
  const formData = new FormData()
  formData.append('photo', file)

  const response = await httpClient.patch<Chat>(`/chats/groups/${chatId}/photo`, formData)
  return response.data
}

export async function getGroupDetail(chatId: string): Promise<GroupDetail> {
  const response = await httpClient.get<GroupDetail>(`/chats/groups/${chatId}`)
  return response.data
}

export async function inviteToGroup(chatId: string, invitedUserId: string): Promise<void> {
  await httpClient.post(`/chats/groups/${chatId}/invitations`, { invitedUserId })
}

export async function getPendingInvitations(): Promise<PendingInvitation[]> {
  const response = await httpClient.get<PendingInvitation[]>('/chats/groups/invitations')
  return response.data
}

export async function acceptInvitation(invitationId: string): Promise<void> {
  await httpClient.patch(`/chats/groups/invitations/${invitationId}/accept`)
}

export async function rejectInvitation(invitationId: string): Promise<void> {
  await httpClient.patch(`/chats/groups/invitations/${invitationId}/reject`)
}

export async function leaveGroup(chatId: string): Promise<void> {
  await httpClient.patch(`/chats/groups/${chatId}/leave`)
}

export async function deleteGroup(chatId: string): Promise<void> {
  await httpClient.delete(`/chats/groups/${chatId}`)
}

export async function promoteToAdmin(chatId: string, userId: string): Promise<void> {
  await httpClient.patch(`/chats/groups/${chatId}/participants/${userId}/promote`)
}

export async function demoteAdmin(chatId: string, userId: string): Promise<void> {
  await httpClient.patch(`/chats/groups/${chatId}/participants/${userId}/demote`)
}

export async function removeParticipant(chatId: string, userId: string): Promise<void> {
  await httpClient.delete(`/chats/groups/${chatId}/participants/${userId}`)
}

export async function transferOwnership(chatId: string, userId: string): Promise<void> {
  await httpClient.patch(`/chats/groups/${chatId}/owner/${userId}`)
}
