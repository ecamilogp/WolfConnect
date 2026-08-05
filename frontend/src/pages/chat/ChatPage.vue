<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import { useChatStore } from '@/stores/chat.store'

const route = useRoute()
const chatStore = useChatStore()
const { t } = useI18n()

const chat = computed(() =>
  chatStore.chats.find((item) => item.id === String(route.params.chatId)),
)

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header
      v-if="chat"
      class="flex items-center gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10"
    >
      <AppAvatar :src="chat.imageUrl ?? undefined" :initials="initials(chat.name)" size="36px" />
      <p class="font-semibold">{{ chat.name }}</p>
    </header>

    <div class="flex flex-1 items-center justify-center text-sm opacity-70">
      {{ t('chat.messagesComingSoon') }}
    </div>
  </div>
</template>
