<script setup lang="ts">
import { QBadge } from 'quasar'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import type { ChatSummary } from '@/types/models/chat.model'

defineProps<{
  chat: ChatSummary
  active?: boolean
}>()

defineEmits<{ click: [] }>()

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
  <li
    class="conversation-item flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2"
    :class="{ 'conversation-item--active': active }"
    @click="$emit('click')"
  >
    <div class="relative shrink-0">
      <AppAvatar :src="chat.imageUrl ?? undefined" :initials="initials(chat.name)" size="40px" />
      <QBadge v-if="chat.unreadCount > 0" color="primary" rounded floating class="unread-badge">
        {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
      </QBadge>
    </div>
    <p
      class="flex-1 truncate text-sm translate-y-2"
      :class="chat.unreadCount > 0 ? 'font-bold' : 'font-medium'"
    >
      {{ chat.name }}
    </p>
  </li>
</template>

<style scoped>
.conversation-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.body--dark .conversation-item:hover {
  background-color: rgba(255, 255, 255, 0.06);
}

.conversation-item--active {
  background-color: color-mix(in srgb, var(--q-primary) 12%, transparent);
}

.unread-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  font-size: 10px;
  font-weight: 700;
  justify-content: center;
}
</style>
