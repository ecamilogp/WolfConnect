<script setup lang="ts">
import { computed } from 'vue'
import { QChatMessage, QIcon } from 'quasar'
import { useI18n } from 'vue-i18n'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import { useTheme } from '@/composables/useTheme'
import { useImagePreview } from '@/composables/useImagePreview'
import type { MessageListItem } from '@/types/models/message.model'

const props = defineProps<{
  message: MessageListItem
  isOwn: boolean
  isGroup?: boolean
}>()

const { t } = useI18n()
const { isDark } = useTheme()
const { openImagePreview } = useImagePreview()

const ownTextColor = computed(() => (isDark.value ? 'black' : 'white'))

const bubbleText = computed(() => (props.message.content ? [props.message.content] : []))

function isImageAttachment(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

function isVideoAttachment(mimeType: string): boolean {
  return mimeType.startsWith('video/')
}

function fileIcon(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'picture_as_pdf'
  if (mimeType.includes('word')) return 'description'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'table_chart'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'slideshow'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('tar') || mimeType.includes('gzip')) {
    return 'folder_zip'
  }
  return 'insert_drive_file'
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const senderName = computed(() => {
  if (!props.isGroup || props.isOwn || !props.message.sender) {
    return undefined
  }

  return `${props.message.sender.firstName} ${props.message.sender.lastName}`
})

const showAvatar = computed(
  () => props.isGroup && props.message.type === 'TEXT' && !!props.message.sender,
)

const senderInitials = computed(() => {
  const sender = props.message.sender

  if (!sender) {
    return undefined
  }

  return `${sender.firstName.charAt(0)}${sender.lastName.charAt(0)}`.toUpperCase()
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
    :text-color="isOwn ? ownTextColor : 'black'"
    :text="bubbleText"
  >
    <template v-if="showAvatar" #avatar>
      <AppAvatar
        :src="message.sender?.profileImage ?? undefined"
        :initials="senderInitials"
        size="32px"
        :class="isOwn ? 'ml-2' : 'mr-2'"
        previewable
      />
    </template>

    <template v-if="message.attachments.length > 0" #default>
      <div class="flex flex-col gap-2">
        <div v-for="attachment in message.attachments" :key="attachment.id">
          <img
            v-if="isImageAttachment(attachment.mimeType)"
            :src="attachment.url"
            :alt="attachment.originalName"
            class="message-bubble__image cursor-pointer rounded-lg"
            @click="openImagePreview(attachment.url, attachment.originalName)"
          />

          <video
            v-else-if="isVideoAttachment(attachment.mimeType)"
            :src="attachment.url"
            controls
            class="message-bubble__video rounded-lg"
          />

          <a
            v-else
            :href="attachment.url"
            target="_blank"
            rel="noopener"
            :download="attachment.originalName"
            :aria-label="t('chat.downloadAttachment')"
            class="message-bubble__file flex items-center gap-2 rounded-lg px-3 py-2"
          >
            <QIcon :name="fileIcon(attachment.mimeType)" size="24px" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ attachment.originalName }}</p>
              <p class="text-xs opacity-70">{{ formatFileSize(attachment.size) }}</p>
            </div>
            <QIcon name="download" size="18px" />
          </a>
        </div>

        <p v-if="message.content" class="message-bubble__caption">{{ message.content }}</p>
      </div>
    </template>

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
  vertical-align: middle;
}

.message-bubble__receipt--read {
  color: hsl(180, 93%, 50%);
  text-shadow: 0 0 1px rgb(0, 0, 0);
}

body.body--dark .message-bubble__receipt--read {
  color: black;
  text-shadow: 0 0 1px white;
}

:deep(.q-message-container) {
  max-width: 100%;
}

:deep(.q-message-container > div:last-child) {
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

.message-bubble__image {
  display: block;
  max-width: 100%;
  max-height: 320px;
  width: auto;
  object-fit: cover;
}

.message-bubble__video {
  display: block;
  max-width: 100%;
  max-height: 320px;
}

.message-bubble__file {
  background-color: rgba(0, 0, 0, 0.08);
  min-width: 200px;
  max-width: 100%;
  text-decoration: none;
  color: inherit;
}

.body--dark .message-bubble__file {
  background-color: rgba(255, 255, 255, 0.12);
}

.message-bubble__caption {
  margin: 0;
  white-space: pre-wrap;
}
</style>
