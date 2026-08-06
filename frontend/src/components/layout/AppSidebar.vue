<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { QAvatar, QBtn, QIcon, QInput, QItem, QItemSection, QList, QMenu, QTooltip } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import LanguageToggle from '@/components/ui/LanguageToggle.vue'
import ConversationList from '@/components/chat/ConversationList.vue'
import NewChatModal from '@/components/chat/NewChatModal.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useChatStore } from '@/stores/chat.store'
import { useTheme } from '@/composables/useTheme'
import { useChatSocket } from '@/composables/useChatSocket'
import type { ChatSummary } from '@/types/models/chat.model'
import type { Message } from '@/types/models/message.model'
import brandMark from '@/assets/images/WolfconnectimageLight.png'
import brandMarkDark from '@/assets/images/WolfconnectimageDark.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const chatStore = useChatStore()
const chatSocket = useChatSocket()
const { t } = useI18n()
const { isDark } = useTheme()

const search = ref('')
const isNewChatOpen = ref(false)

const activeChatId = computed(() => {
  const chatId = route.params.chatId

  return typeof chatId === 'string' ? chatId : null
})

const filteredChats = computed(() => {
  const query = search.value.trim().toLowerCase()

  if (query.length === 0) {
    return chatStore.chats
  }

  return chatStore.chats.filter((chat) => chat.name.toLowerCase().includes(query))
})

onMounted(() => {
  chatStore.fetchChats()
})

const unsubscribeChatSocket = chatSocket.subscribe({
  onMessageNew: (message: Message) => {
    chatStore.applyIncomingMessage({
      chatId: message.chatId,
      senderId: message.senderId,
      currentUserId: authStore.user?.id ?? '',
      activeChatId: activeChatId.value,
    })
  },
  onMessageEdited: () => {},
  onMessageDeleted: () => {},
  onChatNew: (chat: ChatSummary) => {
    chatStore.upsertChat(chat)
  },
})

onUnmounted(() => {
  unsubscribeChatSocket()
})

function goToChat(chatId: string): void {
  router.push({ name: 'chat', params: { chatId } })
}

async function handleNewChat(userId: string): Promise<void> {
  const chat = await chatStore.createPrivateChat(userId)
  goToChat(chat.id)
}

const fullName = computed(() => {
  const user = authStore.user

  if (!user) {
    return ''
  }

  return `${user.firstName} ${user.lastName}`
})

const initials = computed(() => {
  const user = authStore.user

  if (!user) {
    return ''
  }

  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
})

async function handleLogout(): Promise<void> {
  authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <aside class="app-sidebar flex h-full w-80 shrink-0 flex-col">
    <div class="flex items-center gap-2 px-4 py-4">
      <img
        :src="isDark ? brandMarkDark : brandMark"
        alt="WolfConnect"
        class="h-9 w-auto object-cover"
      />
      <div class="flex ml-6 mb-1 items-end justify-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </div>

    <div class="flex items-center gap-2 px-3 pb-3">
      <QInput
        v-model="search"
        class="flex-1"
        :placeholder="t('sidebar.searchPlaceholder')"
        dense
        outlined
        rounded
      >
        <template #prepend>
          <QIcon name="search" size="18px" />
        </template>
      </QInput>

      <QBtn round flat dense icon="add" color="grey-6" @click="isNewChatOpen = true">
        <QTooltip anchor="bottom middle" self="top middle">
          {{ t('sidebar.newChatTooltip') }}
        </QTooltip>
      </QBtn>
    </div>

    <div class="flex-1 overflow-y-auto px-2">
      <ConversationList
        :chats="filteredChats"
        :is-loading="chatStore.isLoading"
        :active-chat-id="activeChatId"
        @select="goToChat"
      />
    </div>

    <NewChatModal v-model="isNewChatOpen" @select="handleNewChat" />

    <div class="app-sidebar__footer border-t border-white/10 px-6 py-4">
      <div class="flex items-center gap-3">
        <QAvatar
          size="45px"
          text-color="white"
          class="font-semibold bg-brand-violet dark:bg-brand-amber"
        >
          {{ initials }}
        </QAvatar>

        <div class="min-w-0 flex-1 overflow-hidden">
          <p class="truncate text-sm font-semibold leading-tight translate-y-3">
            {{ fullName }}
            <span class="font-normal text-gray-500 dark:text-gray-400">
              — {{ authStore.user?.username }}</span
            >
          </p>

          <p class="truncate text-xs leading-tight text-gray-500 dark:text-gray-400">
            {{ authStore.user?.email }}
          </p>
        </div>

        <QBtn round flat dense icon="more_vert" color="grey-6">
          <QMenu>
            <QList dense>
              <QItem v-close-popup clickable @click="handleLogout">
                <QItemSection>
                  {{ t('layout.logout') }}
                </QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </QBtn>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  background-color: #faf8f8;
  border-right: 1px solid #cecdcd;
}

.body--dark .app-sidebar {
  background-color: var(--q-dark);
  border-right-color: #4e4d51;
}

.app-sidebar__footer {
  border-top: 1px solid #cecdcd;
}

.body--dark .app-sidebar__footer {
  border-top-color: #4e4d51;
}
</style>
