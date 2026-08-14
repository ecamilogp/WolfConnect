<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QBtn, QIcon, QInput } from 'quasar'
import { useI18n } from 'vue-i18n'

import EmojiPicker from './EmojiPicker.vue'
import type { MessageListItem } from '@/types/models/message.model'

const props = defineProps<{
  replyTarget?: MessageListItem | null
  editTarget?: MessageListItem | null
}>()

const emit = defineEmits<{
  send: [payload: { content: string; replyToMessageId?: string }]
  sendAttachment: [payload: { content: string; file: File }]
  editMessage: [payload: { messageId: string; content: string }]
  cancelReply: []
  cancelEdit: []
}>()

const { t } = useI18n()

const content = ref('')
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.editTarget,
  (target) => {
    if (target) {
      content.value = target.content ?? ''
      selectedFile.value = null
    } else {
      content.value = ''
    }
  },
)

const replyPreviewText = computed(() => {
  const target = props.replyTarget

  if (!target) {
    return ''
  }

  return target.content && target.content.trim().length > 0
    ? target.content
    : t('chat.replyPreviewFallback')
})

function openFilePicker(): void {
  fileInputRef.value?.click()
}

function onFileChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    selectedFile.value = file
  }

  target.value = ''
}

function clearSelectedFile(): void {
  selectedFile.value = null
}

function insertEmoji(emoji: string): void {
  content.value += emoji
}

function handleSubmit(): void {
  const trimmed = content.value.trim()

  if (props.editTarget) {
    if (trimmed.length === 0) {
      return
    }

    emit('editMessage', { messageId: props.editTarget.id, content: trimmed })
    content.value = ''
    return
  }

  if (selectedFile.value) {
    const file = selectedFile.value

    content.value = ''
    selectedFile.value = null

    emit('sendAttachment', { content: trimmed, file })
    return
  }

  if (trimmed.length === 0) {
    return
  }

  emit('send', { content: trimmed, replyToMessageId: props.replyTarget?.id })
  content.value = ''
}
</script>

<template>
  <form
    class="flex flex-col gap-2 border-t border-black/20 px-4 py-3 dark:border-white/20"
    @submit.prevent="handleSubmit"
  >
    <div
      v-if="editTarget"
      class="flex items-center gap-2 self-stretch rounded-lg bg-black/5 px-3 py-1.5 text-sm dark:bg-white/10"
    >
      <QIcon name="edit" size="16px" color="primary" />
      <span class="flex-1 truncate">{{ t('chat.editingMessage') }}</span>
      <QBtn
        round
        flat
        dense
        size="sm"
        icon="close"
        :aria-label="t('chat.cancelEdit')"
        @click="emit('cancelEdit')"
      />
    </div>

    <div
      v-else-if="replyTarget"
      class="flex items-center gap-2 self-stretch rounded-lg border-l-4 border-primary bg-black/5 px-3 py-1.5 text-sm dark:bg-white/10"
    >
      <QIcon name="reply" size="16px" color="primary" />
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold text-primary">
          {{ replyTarget.sender ? `${replyTarget.sender.firstName} ${replyTarget.sender.lastName}` : '' }}
        </p>
        <p class="truncate">{{ replyPreviewText }}</p>
      </div>
      <QBtn
        round
        flat
        dense
        size="sm"
        icon="close"
        :aria-label="t('chat.cancelReply')"
        @click="emit('cancelReply')"
      />
    </div>

    <div
      v-if="selectedFile"
      class="flex items-center gap-2 self-start rounded-lg bg-black/5 px-3 py-1.5 text-sm dark:bg-white/10"
    >
      <QIcon name="attach_file" size="16px" />
      <span class="max-w-[220px] truncate">{{ selectedFile.name }}</span>
      <QBtn
        round
        flat
        dense
        size="sm"
        icon="close"
        :aria-label="t('chat.removeAttachment')"
        @click="clearSelectedFile"
      />
    </div>

    <div class="flex items-end gap-2">
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        :aria-label="t('chat.attachFile')"
        @change="onFileChange"
      />

      <QBtn
        round
        flat
        dense
        icon="attach_file"
        color="grey-6"
        :disable="!!editTarget"
        :aria-label="t('chat.attachFile')"
        @click="openFilePicker"
      />

      <EmojiPicker @select="insertEmoji" />

      <QInput
        v-model="content"
        class="flex-1"
        dense
        outlined
        rounded
        autogrow
        :placeholder="selectedFile ? t('chat.captionPlaceholder') : t('chat.messagePlaceholder')"
        @keydown.enter.exact.prevent="handleSubmit"
      />

      <QBtn round unelevated color="primary" :icon="editTarget ? 'check' : 'send'" type="submit" />
    </div>
  </form>
</template>
