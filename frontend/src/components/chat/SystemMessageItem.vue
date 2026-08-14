<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useTheme } from '@/composables/useTheme'
import type { MessageListItem } from '@/types/models/message.model'

const props = defineProps<{
  message: MessageListItem
}>()

const { t } = useI18n()
const { isDark } = useTheme()

const targetName = computed(() => {
  const payload = props.message.systemEventPayload

  if (!payload || typeof payload.targetName !== 'string') {
    return ''
  }

  return payload.targetName
})

const text = computed(() => {
  switch (props.message.systemEventType) {
    case 'PARTICIPANT_LEFT':
      return t('chat.systemEvents.participantLeft', { name: targetName.value })
    case 'PARTICIPANT_REMOVED':
      return t('chat.systemEvents.participantRemoved', { name: targetName.value })
    case 'PARTICIPANT_JOINED':
      return t('chat.systemEvents.participantJoined', { name: targetName.value })
    default:
      return ''
  }
})
</script>

<template>
  <div class="flex justify-center py-1.5">
    <span
      class="message rounded-full bg-primary px-3 py-1 text-center text-xs"
      :class="isDark ? 'text-black' : 'text-white'"
    >
      {{ text }}
    </span>
  </div>
</template>
