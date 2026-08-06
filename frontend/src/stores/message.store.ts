import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getMessages, markMessagesAsRead } from '@/services/http/message.service'
import type { Message, MessageListItem } from '@/types/models/message.model'

function toListItem(message: Message): MessageListItem {
  return {
    id: message.id,
    senderId: message.senderId,
    content: message.content,
    type: message.type,
    createdAt: message.createdAt,
    editedAt: message.editedAt,
    replyTo: message.replyTo,
    reactions: message.reactions,
  }
}

export const useMessageStore = defineStore('message', () => {
  const activeChatId = ref<string | null>(null)
  const messages = ref<MessageListItem[]>([])
  const isLoading = ref(false)

  async function openChat(chatId: string): Promise<void> {
    activeChatId.value = chatId
    isLoading.value = true

    try {
      messages.value = await getMessages(chatId)
      await markMessagesAsRead(chatId)
    } finally {
      isLoading.value = false
    }
  }

  function closeChat(): void {
    activeChatId.value = null
    messages.value = []
  }

  function handleIncomingMessage(message: Message): void {
    if (message.chatId !== activeChatId.value) {
      return
    }

    messages.value.push(toListItem(message))
  }

  function handleEditedMessage(message: Message): void {
    if (message.chatId !== activeChatId.value) {
      return
    }

    const index = messages.value.findIndex((item) => item.id === message.id)

    if (index !== -1) {
      messages.value[index] = toListItem(message)
    }
  }

  function handleDeletedMessage(messageId: string, chatId: string): void {
    if (chatId !== activeChatId.value) {
      return
    }

    messages.value = messages.value.filter((item) => item.id !== messageId)
  }

  return {
    activeChatId,
    messages,
    isLoading,
    openChat,
    closeChat,
    handleIncomingMessage,
    handleEditedMessage,
    handleDeletedMessage,
  }
})
