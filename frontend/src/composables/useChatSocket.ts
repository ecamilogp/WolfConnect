import { connectSocket } from '@/services/realtime/socket-client'
import type { Chat, ChatSummary } from '@/types/models/chat.model'
import type { Message } from '@/types/models/message.model'
import type { Notification } from '@/types/models/notification.model'
import type {
  ChatLeftPayload,
  GroupOwnershipTransferredPayload,
  GroupParticipantAddedPayload,
  GroupParticipantRemovedPayload,
  GroupRoleChangedPayload,
  MessageDeletedPayload,
  MessageReadUpdatedPayload,
} from '@/types/socket/payloads.type'

interface ChatSocketHandlers {
  onMessageNew: (message: Message) => void
  onMessageEdited: (message: Message) => void
  onMessageDeleted: (payload: MessageDeletedPayload) => void
  onChatNew?: (chat: ChatSummary) => void
  onChatLeft?: (payload: ChatLeftPayload) => void
  onGroupUpdated?: (chat: Chat) => void
  onGroupRoleChanged?: (payload: GroupRoleChangedPayload) => void
  onGroupParticipantAdded?: (payload: GroupParticipantAddedPayload) => void
  onGroupParticipantRemoved?: (payload: GroupParticipantRemovedPayload) => void
  onGroupOwnershipTransferred?: (payload: GroupOwnershipTransferredPayload) => void
  onMessageReadUpdated?: (payload: MessageReadUpdatedPayload) => void
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

  function subscribeToNotifications(handler: (notification: Notification) => void): () => void {
    socket.on('notification:new', handler)

    return () => {
      socket.off('notification:new', handler)
    }
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

    if (handlers.onChatLeft) {
      socket.on('chat:left', handlers.onChatLeft)
    }

    if (handlers.onGroupUpdated) {
      socket.on('group:updated', handlers.onGroupUpdated)
    }

    if (handlers.onGroupRoleChanged) {
      socket.on('group:role:changed', handlers.onGroupRoleChanged)
    }

    if (handlers.onGroupParticipantAdded) {
      socket.on('group:participant:added', handlers.onGroupParticipantAdded)
    }

    if (handlers.onGroupParticipantRemoved) {
      socket.on('group:participant:removed', handlers.onGroupParticipantRemoved)
    }

    if (handlers.onGroupOwnershipTransferred) {
      socket.on('group:ownership:transferred', handlers.onGroupOwnershipTransferred)
    }

    if (handlers.onMessageReadUpdated) {
      socket.on('message:read:updated', handlers.onMessageReadUpdated)
    }

    return () => {
      socket.off('message:new', handlers.onMessageNew)
      socket.off('message:edited', handlers.onMessageEdited)
      socket.off('message:deleted', handlers.onMessageDeleted)
      socket.off('connect', handleReconnect)

      if (handlers.onChatNew) {
        socket.off('chat:new', handlers.onChatNew)
      }

      if (handlers.onChatLeft) {
        socket.off('chat:left', handlers.onChatLeft)
      }

      if (handlers.onGroupUpdated) {
        socket.off('group:updated', handlers.onGroupUpdated)
      }

      if (handlers.onGroupRoleChanged) {
        socket.off('group:role:changed', handlers.onGroupRoleChanged)
      }

      if (handlers.onGroupParticipantAdded) {
        socket.off('group:participant:added', handlers.onGroupParticipantAdded)
      }

      if (handlers.onGroupParticipantRemoved) {
        socket.off('group:participant:removed', handlers.onGroupParticipantRemoved)
      }

      if (handlers.onGroupOwnershipTransferred) {
        socket.off('group:ownership:transferred', handlers.onGroupOwnershipTransferred)
      }

      if (handlers.onMessageReadUpdated) {
        socket.off('message:read:updated', handlers.onMessageReadUpdated)
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
    subscribeToNotifications,
  }
}
