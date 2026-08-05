<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppLoadingState from '@/components/ui/AppLoadingState.vue'
import ConversationListItem from './ConversationListItem.vue'
import type { ChatSummary } from '@/types/models/chat.model'

const props = withDefaults(
  defineProps<{
    chats: ChatSummary[]
    isLoading: boolean
    activeChatId?: string | null
  }>(),
  {
    activeChatId: null,
  },
)

defineEmits<{ select: [chatId: string] }>()

const { t } = useI18n()

const hasChats = computed(() => props.chats.length > 0)
</script>

<template>
  <AppLoadingState v-if="isLoading" />

  <AppEmptyState
    v-else-if="!hasChats"
    :title="t('sidebar.noConversationsTitle')"
    :description="t('sidebar.noConversationsDescription')"
  />

  <ul v-else class="flex flex-col gap-1">
    <ConversationListItem
      v-for="chat in chats"
      :key="chat.id"
      :chat="chat"
      :active="chat.id === activeChatId"
      @click="$emit('select', chat.id)"
    />
  </ul>
</template>
