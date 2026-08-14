import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getMessages, markMessagesAsRead } from '@/services/http/message.service'
import type { Message, MessageListItem, MessageReactionSummary } from '@/types/models/message.model'

function toListItem(message: Message): MessageListItem {
  return {
    id: message.id,
    senderId: message.senderId,
    sender: message.sender,
    content: message.content,
    type: message.type,
    systemEventType: message.systemEventType,
    systemEventPayload: message.systemEventPayload,
    isReadByAll: message.isReadByAll,
    createdAt: message.createdAt,
    editedAt: message.editedAt,
    replyTo: message.replyTo,
    reactions: message.reactions,
    attachments: message.attachments,
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

    markMessagesAsRead(message.chatId).catch((error) => {
      console.error('Failed to mark incoming message as read', error)
    })
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

  function handleReactionUpdated(
    chatId: string,
    messageId: string,
    reactions: MessageReactionSummary[],
  ): void {
    if (chatId !== activeChatId.value) {
      return
    }

    const index = messages.value.findIndex((item) => item.id === messageId)
    const current = messages.value[index]

    if (current) {
      messages.value[index] = { ...current, reactions }
    }
  }

  function handleMessagesReadUpdated(chatId: string, messageIds: string[]): void {
    if (chatId !== activeChatId.value) {
      return
    }

    const readIds = new Set(messageIds)

    messages.value = messages.value.map((item) =>
      readIds.has(item.id) ? { ...item, isReadByAll: true } : item,
    )
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
    handleReactionUpdated,
    handleMessagesReadUpdated,
  }
})
