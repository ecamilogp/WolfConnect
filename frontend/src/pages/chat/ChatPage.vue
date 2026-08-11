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
import type { Chat } from '@/types/models/chat.model'
import type { Message } from '@/types/models/message.model'
import type { ChatLeftPayload, MessageDeletedPayload } from '@/types/socket/payloads.type'

const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const messageStore = useMessageStore()
const authStore = useAuthStore()
const groupStore = useGroupStore()
const chatSocket = useChatSocket()

const chatId = computed(() => String(route.params.chatId))

const chat = computed(() => chatStore.chats.find((item) => item.id === chatId.value))
const isGroup = computed(() => chat.value?.type === 'GROUP')
const isGroupInfoOpen = ref(false)

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
      <p class="flex-1 font-semibold translate-y-2">{{ chat.name }}</p>

      <QBtn v-if="isGroup" round flat dense icon="info" @click="isGroupInfoOpen = true" />
    </header>

    <MessageList
      :messages="messageStore.messages"
      :is-loading="messageStore.isLoading"
      :current-user-id="authStore.user?.id ?? ''"
      :is-group="isGroup"
    />

    <MessageComposer @send="handleSend" />

    <GroupInfoPanel
      v-model="isGroupInfoOpen"
      :chat-id="chatId"
      @left="leaveChatView"
      @deleted="leaveChatView"
    />
  </div>
</template>
