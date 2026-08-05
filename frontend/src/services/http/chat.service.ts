import { httpClient } from './http-client'
import type { Chat, ChatSummary } from '@/types/models/chat.model'

export async function getChats(): Promise<ChatSummary[]> {
  const response = await httpClient.get<ChatSummary[]>('/chats')
  return response.data
}

export async function createPrivateChat(targetUserId: string): Promise<Chat> {
  const response = await httpClient.post<Chat>('/chats/private', { targetUserId })
  return response.data
}
