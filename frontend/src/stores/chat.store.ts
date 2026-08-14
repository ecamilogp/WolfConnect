import { ref } from 'vue'
import { defineStore } from 'pinia'

import { createPrivateChat as createPrivateChatRequest, getChats } from '@/services/http/chat.service'
import type { ChatSummary } from '@/types/models/chat.model'

export const useChatStore = defineStore('chat', () => {
  const chats = ref<ChatSummary[]>([])
  const isLoading = ref(false)
  const isReady = ref(false)

  async function fetchChats(): Promise<void> {
    isLoading.value = true

    try {
      chats.value = await getChats()
    } finally {
      isLoading.value = false
      isReady.value = true
    }
  }

  async function createPrivateChat(targetUserId: string): Promise<ChatSummary> {
    const created = await createPrivateChatRequest(targetUserId)
    await fetchChats()

    return (
      chats.value.find((chat) => chat.id === created.id) ?? {
        ...created,
        name: '',
        unreadCount: 0,
        otherUserId: targetUserId,
      }
    )
  }

  function resetUnread(chatId: string): void {
    const chat = chats.value.find((item) => item.id === chatId)

    if (chat) {
      chat.unreadCount = 0
    }
  }

  function removeChat(chatId: string): void {
    chats.value = chats.value.filter((chat) => chat.id !== chatId)
  }

  function updateChatInfo(chatId: string, info: { name: string | null; imageUrl: string | null }): void {
    const chat = chats.value.find((item) => item.id === chatId)

    if (chat) {
      chat.name = info.name ?? chat.name
      chat.imageUrl = info.imageUrl
    }
  }

  function upsertChat(summary: ChatSummary): void {
    const index = chats.value.findIndex((item) => item.id === summary.id)

    if (index !== -1) {
      chats.value.splice(index, 1)
    }

    chats.value.unshift(summary)
  }

  function applyIncomingMessage(options: {
    chatId: string
    senderId: string | null
    currentUserId: string
    activeChatId: string | null
  }): void {
    const index = chats.value.findIndex((item) => item.id === options.chatId)
    const chat = index === -1 ? undefined : chats.value[index]

    if (!chat) {
      return
    }

    if (options.chatId !== options.activeChatId && options.senderId !== options.currentUserId) {
      chat.unreadCount += 1
    }

    chats.value.splice(index, 1)
    chats.value.unshift(chat)
  }

  return {
    chats,
    isLoading,
    isReady,
    fetchChats,
    createPrivateChat,
    resetUnread,
    upsertChat,
    removeChat,
    updateChatInfo,
    applyIncomingMessage,
  }
})
