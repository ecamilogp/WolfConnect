import { httpClient } from './http-client'
import type { MessageListItem } from '@/types/models/message.model'

export async function getMessages(chatId: string): Promise<MessageListItem[]> {
  const response = await httpClient.get<MessageListItem[]>(`/chats/${chatId}/messages`)
  return response.data
}

export async function searchMessages(chatId: string, query: string): Promise<MessageListItem[]> {
  const response = await httpClient.get<MessageListItem[]>(`/chats/${chatId}/messages/search`, {
    params: { q: query },
  })
  return response.data
}

export async function markMessagesAsRead(chatId: string): Promise<void> {
  await httpClient.patch(`/chats/${chatId}/read`)
}

export async function setMessageReaction(messageId: string, emoji: string): Promise<void> {
  await httpClient.put(`/chats/messages/${messageId}/reactions`, { emoji })
}

export async function removeMessageReaction(messageId: string): Promise<void> {
  await httpClient.delete(`/chats/messages/${messageId}/reactions`)
}
