<script setup lang="ts">
import { computed } from 'vue'
import { QChatMessage, QIcon } from 'quasar'
import { useI18n } from 'vue-i18n'

import type { MessageListItem } from '@/types/models/message.model'

const props = defineProps<{
  message: MessageListItem
  isOwn: boolean
  isGroup?: boolean
}>()

const { t } = useI18n()

const senderName = computed(() => {
  if (!props.isGroup || props.isOwn || !props.message.sender) {
    return undefined
  }

  return `${props.message.sender.firstName} ${props.message.sender.lastName}`
})

const stamp = computed(() => {
  const time = new Date(props.message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return props.message.editedAt ? `${t('chat.edited')} · ${time}` : time
})

const showReadReceipt = computed(() => props.isOwn && props.message.type === 'TEXT')

const readReceiptIcon = computed(() => (props.message.isReadByAll ? 'done_all' : 'done'))

const readReceiptLabel = computed(() =>
  props.message.isReadByAll ? t('chat.readByAll') : t('chat.sent'),
)
</script>

<template>
  <QChatMessage
    :sent="isOwn"
    :name="senderName"
    :bg-color="isOwn ? 'primary' : 'grey-4'"
    :text-color="isOwn ? 'white' : 'black'"
    :text="[message.content ?? '']"
  >
    <template #stamp>
      <span>{{ stamp }}</span>
      <QIcon
        v-if="showReadReceipt"
        :name="readReceiptIcon"
        size="16px"
        class="q-ml-xs message-bubble__receipt"
        :class="{ 'message-bubble__receipt--read': message.isReadByAll }"
        :aria-label="readReceiptLabel"
      />
    </template>
  </QChatMessage>
</template>

<style scoped>
.message-bubble__receipt {
  opacity: 0.65;
  vertical-align: middle;
}

.message-bubble__receipt--read {
  color: #1dfbff;
}

:deep(.q-message-container) {
  max-width: 100%;
}

:deep(.q-message-container > div) {
  max-width: min(75%, 32rem);
  min-width: 0;
}

:deep(.q-message-text) {
  max-width: 100%;
}

:deep(.q-message-text-content) {
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
