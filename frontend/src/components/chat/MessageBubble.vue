<script setup lang="ts">
import { computed } from 'vue'
import { QChatMessage } from 'quasar'
import { useI18n } from 'vue-i18n'

import type { MessageListItem } from '@/types/models/message.model'

const props = defineProps<{
  message: MessageListItem
  isOwn: boolean
}>()

const { t } = useI18n()

const stamp = computed(() => {
  const time = new Date(props.message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return props.message.editedAt ? `${t('chat.edited')} · ${time}` : time
})
</script>

<template>
  <QChatMessage
    :sent="isOwn"
    :bg-color="isOwn ? 'primary' : 'grey-4'"
    :text-color="isOwn ? 'white' : 'black'"
    :text="[message.content ?? '']"
    :stamp="stamp"
  />
</template>
