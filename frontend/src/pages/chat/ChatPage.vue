<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import MessageList from '@/components/chat/MessageList.vue'
import MessageComposer from '@/components/chat/MessageComposer.vue'
import { useChatStore } from '@/stores/chat.store'
import { useMessageStore } from '@/stores/message.store'
import { useAuthStore } from '@/stores/auth.store'
import { useChatSocket } from '@/composables/useChatSocket'
import type { Message } from '@/types/models/message.model'
import type { MessageDeletedPayload } from '@/types/socket/payloads.type'

const route = useRoute()
const chatStore = useChatStore()
const messageStore = useMessageStore()
const authStore = useAuthStore()
const chatSocket = useChatSocket()

const chatId = computed(() => String(route.params.chatId))

const chat = computed(() => chatStore.chats.find((item) => item.id === chatId.value))

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}

const unsubscribe = chatSocket.subscribe({
  onMessageNew: (message: Message) => messageStore.handleIncomingMessage(message),
  onMessageEdited: (message: Message) => messageStore.handleEditedMessage(message),
  onMessageDeleted: (payload: MessageDeletedPayload) =>
    messageStore.handleDeletedMessage(payload.messageId, payload.chatId),
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

onUnmounted(() => {
  unsubscribe()
  messageStore.closeChat()
})

function handleSend(content: string): void {
  chatSocket.sendMessage(chatId.value, content)
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header
      v-if="chat"
      class="flex items-center bg-[#FAF8F8] dark:bg-[#16151B] gap-3 border-b border-black/20 px-4 py-3 dark:border-white/20"
    >
      <AppAvatar :src="chat.imageUrl ?? undefined" :initials="initials(chat.name)" size="36px" />
      <p class="font-semibold translate-y-2">{{ chat.name }}</p>
    </header>

    <MessageList
      :messages="messageStore.messages"
      :is-loading="messageStore.isLoading"
      :current-user-id="authStore.user?.id ?? ''"
    />

    <MessageComposer @send="handleSend" />
  </div>
</template>
