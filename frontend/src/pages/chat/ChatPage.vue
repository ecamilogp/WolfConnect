<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { QBtn } from 'quasar'
import { useRoute, useRouter } from 'vue-router'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import MessageList from '@/components/chat/MessageList.vue'
import MessageComposer from '@/components/chat/MessageComposer.vue'
import GroupInfoPanel from '@/components/chat/GroupInfoPanel.vue'
import { useChatStore } from '@/stores/chat.store'
import { useMessageStore } from '@/stores/message.store'
import { useAuthStore } from '@/stores/auth.store'
import { useGroupStore } from '@/stores/group.store'
import { useChatSocket } from '@/composables/useChatSocket'
import { useAppNotify } from '@/composables/useAppNotify'
import { sendMessageWithAttachment } from '@/services/http/attachment.service'
import type { Chat } from '@/types/models/chat.model'
import type { Message, MessageListItem } from '@/types/models/message.model'
import type {
  ChatLeftPayload,
  MessageDeletedPayload,
  MessageReactionUpdatedPayload,
  MessageReadUpdatedPayload,
} from '@/types/socket/payloads.type'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const messageStore = useMessageStore()
const authStore = useAuthStore()
const groupStore = useGroupStore()
const chatSocket = useChatSocket()
const { notifyError } = useAppNotify()

const chatId = computed(() => String(route.params.chatId))

const chat = computed(() => chatStore.chats.find((item) => item.id === chatId.value))
const isGroup = computed(() => chat.value?.type === 'GROUP')
const isGroupInfoOpen = ref(false)
const replyingTo = ref<MessageListItem | null>(null)
const editingMessage = ref<MessageListItem | null>(null)

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

function leaveChatView(): void {
  chatStore.removeChat(chatId.value)
  router.push({ name: 'chat-empty' })
}

const unsubscribe = chatSocket.subscribe({
  onMessageNew: (message: Message) => messageStore.handleIncomingMessage(message),
  onMessageEdited: (message: Message) => messageStore.handleEditedMessage(message),
  onMessageDeleted: (payload: MessageDeletedPayload) =>
    messageStore.handleDeletedMessage(payload.messageId, payload.chatId),
  onChatLeft: (payload: ChatLeftPayload) => {
    if (payload.chatId === chatId.value) {
      leaveChatView()
    }
  },
  onGroupUpdated: (updatedChat: Chat) => {
    if (updatedChat.id === chatId.value) {
      chatStore.updateChatInfo(updatedChat.id, {
        name: updatedChat.name,
        imageUrl: updatedChat.imageUrl,
      })
    }
  },
  onMessageReadUpdated: (payload: MessageReadUpdatedPayload) => {
    messageStore.handleMessagesReadUpdated(payload.chatId, payload.messageIds)
  },
  onMessageReactionUpdated: (payload: MessageReactionUpdatedPayload) => {
    messageStore.handleReactionUpdated(payload.chatId, payload.messageId, payload.reactions)
  },
})

async function enterChat(id: string): Promise<void> {
  chatSocket.joinChat(id)
  await messageStore.openChat(id)
  chatStore.resetUnread(id)
}

watch(
  chatId,
  (newId) => {
    if (newId) {
      enterChat(newId)
    }
  },
  { immediate: true },
)

watch(
  () => chat.value,
  (value) => {
    if (value?.type === 'GROUP') {
      if (groupStore.groupDetail?.id !== value.id) {
        groupStore.openGroupDetail(value.id)
      }
    } else {
      groupStore.closeGroupDetail()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  unsubscribe()
  messageStore.closeChat()
  groupStore.closeGroupDetail()
})

function handleSend(payload: { content: string; replyToMessageId?: string }): void {
  chatSocket.sendMessage(chatId.value, payload.content, payload.replyToMessageId)
  replyingTo.value = null
}

async function handleSendAttachment(payload: { content: string; file: File }): Promise<void> {
  try {
    await sendMessageWithAttachment(chatId.value, payload.content, payload.file)
  } catch (error) {
    notifyError(error, 'chat.attachmentSendError')
  }
}

function handleEditMessage(payload: { messageId: string; content: string }): void {
  chatSocket.editMessage(payload.messageId, payload.content)
  editingMessage.value = null
}

function handleReplyRequest(message: MessageListItem): void {
  editingMessage.value = null
  replyingTo.value = message
}

function handleEditRequest(message: MessageListItem): void {
  replyingTo.value = null
  editingMessage.value = message
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header
      v-if="chat"
      class="flex items-center bg-[#FAF8F8] dark:bg-[#16151B] gap-3 border-b border-black/20 px-4 py-3 dark:border-white/20"
    >
      <AppAvatar
        :src="chat.imageUrl ?? undefined"
        :initials="initials(chat.name)"
        size="36px"
        previewable
      />
      <p class="flex-1 font-semibold translate-y-2">{{ chat.name }}</p>

      <QBtn v-if="isGroup" round flat dense icon="info" @click="isGroupInfoOpen = true" />
    </header>

    <MessageList
      :messages="messageStore.messages"
      :is-loading="messageStore.isLoading"
      :current-user-id="authStore.user?.id ?? ''"
      :is-group="isGroup"
      @reply="handleReplyRequest"
      @edit="handleEditRequest"
    />

    <MessageComposer
      :reply-target="replyingTo"
      :edit-target="editingMessage"
      @send="handleSend"
      @send-attachment="handleSendAttachment"
      @edit-message="handleEditMessage"
      @cancel-reply="replyingTo = null"
      @cancel-edit="editingMessage = null"
    />

    <GroupInfoPanel
      v-model="isGroupInfoOpen"
      :chat-id="chatId"
      @left="leaveChatView"
      @deleted="leaveChatView"
    />
  </div>
</template>
