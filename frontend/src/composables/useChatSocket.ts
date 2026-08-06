import { connectSocket } from '@/services/realtime/socket-client'
import type { ChatSummary } from '@/types/models/chat.model'
import type { Message } from '@/types/models/message.model'
import type { MessageDeletedPayload } from '@/types/socket/payloads.type'

interface ChatSocketHandlers {
  onMessageNew: (message: Message) => void
  onMessageEdited: (message: Message) => void
  onMessageDeleted: (payload: MessageDeletedPayload) => void
  onChatNew?: (chat: ChatSummary) => void
}

export function useChatSocket() {
  const socket = connectSocket()

  let activeChatId: string | null = null

  function joinChat(chatId: string): void {
    activeChatId = chatId
    socket.emit('chat:join', { chatId })
  }

  function leaveChat(chatId: string): void {
    if (activeChatId === chatId) {
      activeChatId = null
    }

    socket.emit('chat:leave', { chatId })
  }

  function handleReconnect(): void {
    if (activeChatId) {
      socket.emit('chat:join', { chatId: activeChatId })
    }
  }

  function sendMessage(chatId: string, content: string, replyToMessageId?: string): void {
    socket.emit('message:send', { chatId, content, replyToMessageId })
  }

  function editMessage(messageId: string, content: string): void {
    socket.emit('message:edit', { messageId, content })
  }

  function deleteMessage(messageId: string): void {
    socket.emit('message:delete', { messageId })
  }

  function subscribe(handlers: ChatSocketHandlers): () => void {
    socket.on('message:new', handlers.onMessageNew)
    socket.on('message:edited', handlers.onMessageEdited)
    socket.on('message:deleted', handlers.onMessageDeleted)
    socket.on('connect', handleReconnect)

    if (handlers.onChatNew) {
      socket.on('chat:new', handlers.onChatNew)
    }

    return () => {
      socket.off('message:new', handlers.onMessageNew)
      socket.off('message:edited', handlers.onMessageEdited)
      socket.off('message:deleted', handlers.onMessageDeleted)
      socket.off('connect', handleReconnect)

      if (handlers.onChatNew) {
        socket.off('chat:new', handlers.onChatNew)
      }
    }
  }

  return {
    joinChat,
    leaveChat,
    sendMessage,
    editMessage,
    deleteMessage,
    subscribe,
  }
}
