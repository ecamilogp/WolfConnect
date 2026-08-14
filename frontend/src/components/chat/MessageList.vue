<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppLoadingState from '@/components/ui/AppLoadingState.vue'
import MessageBubble from './MessageBubble.vue'
import SystemMessageItem from './SystemMessageItem.vue'
import { useTheme } from '@/composables/useTheme'
import loboDark from '@/assets/images/lobo.png'
import loboLight from '@/assets/images/aullando.png'
import type { MessageListItem } from '@/types/models/message.model'

const props = withDefaults(
  defineProps<{
    messages: MessageListItem[]
    isLoading: boolean
    currentUserId: string
    isGroup?: boolean
  }>(),
  {
    isGroup: false,
  },
)

const emit = defineEmits<{
  reply: [message: MessageListItem]
  edit: [message: MessageListItem]
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
      <img :src="backgroundImage" alt="" class="h-full w-full object-contain opacity-50" />
    </div>

    <div ref="containerRef" class="relative h-full overflow-y-auto px-4 py-3">
      <AppLoadingState v-if="isLoading" />

      <AppEmptyState
        v-else-if="messages.length === 0"
        icon="chat_bubble_outline"
        :title="t('chat.noMessagesTitle')"
        :description="t('chat.noMessagesDescription')"
      />

      <TransitionGroup v-else name="message-fade" tag="div" class="flex flex-col gap-2">
        <template v-for="message in messages" :key="message.id">
          <SystemMessageItem v-if="message.type === 'SYSTEM'" :message="message" />
          <MessageBubble
            v-else
            :message="message"
            :is-own="message.senderId === currentUserId"
            :is-group="isGroup"
            :current-user-id="currentUserId"
            @reply="emit('reply', message)"
            @edit="emit('edit', message)"
          />
        </template>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.message-fade-enter-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.message-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.message-fade-leave-active {
  transition: opacity 0.15s ease;
}

.message-fade-leave-to {
  opacity: 0;
}
</style>
