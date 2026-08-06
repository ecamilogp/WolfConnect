<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppLoadingState from '@/components/ui/AppLoadingState.vue'
import MessageBubble from './MessageBubble.vue'
import { useTheme } from '@/composables/useTheme'
import loboDark from '@/assets/images/lobo.png'
import loboLight from '@/assets/images/aullando.png'
import type { MessageListItem } from '@/types/models/message.model'

const props = defineProps<{
  messages: MessageListItem[]
  isLoading: boolean
  currentUserId: string
}>()

const { t } = useI18n()
const { isDark } = useTheme()

const backgroundImage = computed(() => (isDark.value ? loboDark : loboLight))

const containerRef = ref<HTMLElement | null>(null)

function scrollToBottom(): void {
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight
  }
}

watch(
  () => props.messages.length,
  () => {
    nextTick(scrollToBottom)
  },
)

watch(
  () => props.isLoading,
  (loading) => {
    if (!loading) {
      nextTick(scrollToBottom)
    }
  },
)
</script>

<template>
  <div class="relative min-h-0 flex-1 overflow-hidden">
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <img :src="backgroundImage" alt="" class="h-full w-full object-contain opacity-80" />
    </div>

    <div ref="containerRef" class="relative h-full overflow-y-auto px-4 py-3">
      <AppLoadingState v-if="isLoading" />

      <AppEmptyState
        v-else-if="messages.length === 0"
        icon="chat_bubble_outline"
        :title="t('chat.noMessagesTitle')"
        :description="t('chat.noMessagesDescription')"
      />

      <div v-else class="flex flex-col gap-2">
        <MessageBubble
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :is-own="message.senderId === currentUserId"
        />
      </div>
    </div>
  </div>
</template>
