import { httpClient } from './http-client'
import type { MessageListItem } from '@/types/models/message.model'

export async function getMessages(chatId: string): Promise<MessageListItem[]> {
  const response = await httpClient.get<MessageListItem[]>(`/chats/${chatId}/messages`)
  return response.data
}

export async function markMessagesAsRead(chatId: string): Promise<void> {
  await httpClient.patch(`/chats/${chatId}/read`)
}
