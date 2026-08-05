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

    return chats.value.find((chat) => chat.id === created.id) ?? { ...created, name: '' }
  }

  return {
    chats,
    isLoading,
    isReady,
    fetchChats,
    createPrivateChat,
  }
})
