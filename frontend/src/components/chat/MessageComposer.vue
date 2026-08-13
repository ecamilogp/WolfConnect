<script setup lang="ts">
import { ref } from 'vue'
import { QBtn, QIcon, QInput } from 'quasar'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  send: [content: string]
  sendAttachment: [payload: { content: string; file: File }]
}>()

const { t } = useI18n()

const content = ref('')
const selectedFile = ref<File | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

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

function handleSubmit(): void {
  const trimmed = content.value.trim()

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

  emit('send', trimmed)
  content.value = ''
}
</script>

<template>
  <form
    class="flex flex-col gap-2 border-t border-black/20 px-4 py-3 dark:border-white/20"
    @submit.prevent="handleSubmit"
  >
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
        :aria-label="t('chat.attachFile')"
        @click="openFilePicker"
      />

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

      <QBtn round unelevated color="primary" icon="send" type="submit" />
    </div>
  </form>
</template>
