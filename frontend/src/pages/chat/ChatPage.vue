<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import { QBtn, QIcon, QInput, useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import MessageList from '@/components/chat/MessageList.vue'
import MessageComposer from '@/components/chat/MessageComposer.vue'
import GroupInfoPanel from '@/components/chat/GroupInfoPanel.vue'
import { useChatStore } from '@/stores/chat.store'
import { useMessageStore } from '@/stores/message.store'
import { useAuthStore } from '@/stores/auth.store'
import { useGroupStore } from '@/stores/group.store'
import { usePresenceStore } from '@/stores/presence.store'
import { useChatSocket } from '@/composables/useChatSocket'
import { useAppNotify } from '@/composables/useAppNotify'
import { sendMessageWithAttachment } from '@/services/http/attachment.service'
import { searchMessages } from '@/services/http/message.service'
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
const $q = useQuasar()
const isMobile = computed(() => $q.screen.lt.md)
const chatStore = useChatStore()
const messageStore = useMessageStore()
const authStore = useAuthStore()
const groupStore = useGroupStore()
const presenceStore = usePresenceStore()
const chatSocket = useChatSocket()
const { notifyError } = useAppNotify()
const { t } = useI18n()

const chatId = computed(() => String(route.params.chatId))

const chat = computed(() => chatStore.chats.find((item) => item.id === chatId.value))
const isGroup = computed(() => chat.value?.type === 'GROUP')
const isOtherUserOnline = computed(
  () => chat.value?.type === 'PRIVATE' && presenceStore.isOnline(chat.value.otherUserId),
)
const isGroupInfoOpen = ref(false)
const replyingTo = ref<MessageListItem | null>(null)
const editingMessage = ref<MessageListItem | null>(null)

const messageListRef = ref<InstanceType<typeof MessageList> | null>(null)
const isSearchOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref<MessageListItem[]>([])
const activeResultIndex = ref(0)
const isSearching = ref(false)
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const highlightedMessageId = computed(() => searchResults.value[activeResultIndex.value]?.id ?? null)

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

function goBackToList(): void {
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

function scrollToActiveResult(): void {
  const message = searchResults.value[activeResultIndex.value]

  if (message) {
    messageListRef.value?.scrollToMessage(message.id)
  }
}

async function runSearch(query: string): Promise<void> {
  isSearching.value = true

  try {
    searchResults.value = await searchMessages(chatId.value, query)
    activeResultIndex.value = searchResults.value.length > 0 ? searchResults.value.length - 1 : 0
    scrollToActiveResult()
  } catch (error) {
    notifyError(error, 'chat.searchError')
  } finally {
    isSearching.value = false
  }
}

watch(searchQuery, (query) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  const trimmed = query.trim()

  if (trimmed.length === 0) {
    searchResults.value = []
    activeResultIndex.value = 0
    return
  }

  searchDebounceTimer = setTimeout(() => {
    runSearch(trimmed)
  }, 300)
})

function openSearch(): void {
  isSearchOpen.value = true
}

function closeSearch(): void {
  isSearchOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
  activeResultIndex.value = 0
}

function goToPreviousResult(): void {
  if (searchResults.value.length === 0) {
    return
  }

  activeResultIndex.value =
    (activeResultIndex.value - 1 + searchResults.value.length) % searchResults.value.length
  scrollToActiveResult()
}

function goToNextResult(): void {
  if (searchResults.value.length === 0) {
    return
  }

  activeResultIndex.value = (activeResultIndex.value + 1) % searchResults.value.length
  scrollToActiveResult()
}

watch(chatId, closeSearch)

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
      <template v-if="!isSearchOpen">
        <QBtn
          v-if="isMobile"
          round
          flat
          dense
          icon="arrow_back"
          class="-ml-1"
          @click="goBackToList"
        />

        <AppAvatar
          :src="chat.imageUrl ?? undefined"
          :initials="initials(chat.name)"
          size="36px"
          previewable
          :online="isOtherUserOnline"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate font-semibold translate-y-2">{{ chat.name }}</p>
          <p v-if="isOtherUserOnline" class="text-xs text-positive leading-none">
            {{ t('presence.online') }}
          </p>
        </div>

        <QBtn
          round
          flat
          dense
          icon="search"
          :aria-label="t('chat.searchTooltip')"
          @click="openSearch"
        />
        <QBtn v-if="isGroup" round flat dense icon="info" @click="isGroupInfoOpen = true" />
      </template>

      <template v-else>
        <QInput
          v-model="searchQuery"
          dense
          outlined
          rounded
          autofocus
          class="flex-1"
          :placeholder="t('chat.searchPlaceholder')"
          @keydown.enter="goToPreviousResult"
        >
          <template #prepend>
            <QIcon name="search" size="18px" />
          </template>
        </QInput>

        <p class="min-w-16 whitespace-nowrap text-center text-xs opacity-70">
          <template v-if="searchQuery.trim().length === 0"></template>
          <template v-else-if="isSearching">{{ t('chat.searching') }}</template>
          <template v-else-if="searchResults.length > 0">
            {{ activeResultIndex + 1 }} / {{ searchResults.length }}
          </template>
          <template v-else>{{ t('chat.searchNoResults') }}</template>
        </p>

        <QBtn
          round
          flat
          dense
          icon="keyboard_arrow_up"
          :disable="searchResults.length === 0"
          :aria-label="t('chat.searchPrevious')"
          @click="goToPreviousResult"
        />
        <QBtn
          round
          flat
          dense
          icon="keyboard_arrow_down"
          :disable="searchResults.length === 0"
          :aria-label="t('chat.searchNext')"
          @click="goToNextResult"
        />
        <QBtn
          round
          flat
          dense
          icon="close"
          :aria-label="t('chat.searchClose')"
          @click="closeSearch"
        />
      </template>
    </header>

    <MessageList
      ref="messageListRef"
      :messages="messageStore.messages"
      :is-loading="messageStore.isLoading"
      :current-user-id="authStore.user?.id ?? ''"
      :is-group="isGroup"
      :highlighted-message-id="highlightedMessageId"
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
