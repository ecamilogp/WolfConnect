<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  QChatMessage,
  QIcon,
  QItem,
  QItemSection,
  QList,
  QMenu,
  QSeparator,
  useQuasar,
} from 'quasar'
import { useI18n } from 'vue-i18n'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import EmojiPicker from './EmojiPicker.vue'
import { useTheme } from '@/composables/useTheme'
import { useImagePreview } from '@/composables/useImagePreview'
import { useAppNotify } from '@/composables/useAppNotify'
import { useChatSocket } from '@/composables/useChatSocket'
import { removeMessageReaction, setMessageReaction } from '@/services/http/message.service'
import type { MessageListItem } from '@/types/models/message.model'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '😆']

const props = defineProps<{
  message: MessageListItem
  isOwn: boolean
  isGroup?: boolean
  currentUserId: string
  highlighted?: boolean
}>()

const emit = defineEmits<{
  reply: []
  edit: []
}>()

const { t } = useI18n()
const $q = useQuasar()
const { isDark } = useTheme()
const { openImagePreview } = useImagePreview()
const { notifyError } = useAppNotify()
const chatSocket = useChatSocket()

const bubbleColor = computed(() => {
  if (!props.isOwn) {
    return 'grey-4'
  }
  return isDark.value ? 'brand-amber' : 'primary'
})

const bubbleTextColor = computed(() => (props.isOwn ? 'white' : 'black'))

const myReaction = computed(
  () => props.message.reactions.find((reaction) => reaction.userId === props.currentUserId)?.emoji,
)

const reactionSummary = computed(() => {
  const counts = new Map<string, number>()

  for (const reaction of props.message.reactions) {
    counts.set(reaction.emoji, (counts.get(reaction.emoji) ?? 0) + 1)
  }

  return Array.from(counts.entries()).map(([emoji, count]) => ({
    emoji,
    count,
    mine: myReaction.value === emoji,
  }))
})

const reactionMenuRef = ref<InstanceType<typeof QMenu> | null>(null)
const moreMenuRef = ref<InstanceType<typeof QMenu> | null>(null)

async function handleReactionClick(emoji: string): Promise<void> {
  // Close the quick-reaction dock immediately for instant feedback instead of
  // waiting for the request to resolve — the request itself still happens in
  // the background.
  reactionMenuRef.value?.hide()

  try {
    if (myReaction.value === emoji) {
      await removeMessageReaction(props.message.id)
    } else {
      await setMessageReaction(props.message.id, emoji)
    }
  } catch (error) {
    notifyError(error, 'chat.reactionError')
  }
}

function handleReactionClickFromMoreMenu(emoji: string): void {
  moreMenuRef.value?.hide()
  handleReactionClick(emoji)
}

const isReactionMenuOpen = ref(false)
const isMoreMenuOpen = ref(false)

// On touch devices (phone/tablet) two separate always-visible floating
// buttons per message feel cluttered, since there's no hover state to hide
// them contextually. There, the reaction picker folds into the same "more
// options" menu (one single trigger instead of two), and holding the bubble
// down opens that same menu as an alternative to tapping the trigger.
const isTouchDevice = $q.platform.has.touch

// Whether the message actions should collapse into a single "more options"
// trigger. This must react to viewport width (not just touch capability) so
// that resizing into a mobile/tablet layout on a mouse-driven device (e.g.
// testing responsive breakpoints in devtools) also collapses down to one
// icon instead of showing both floating triggers side by side.
const isCompactActions = computed(() => isTouchDevice || $q.screen.lt.md)

let longPressTimer: ReturnType<typeof setTimeout> | null = null

function cancelLongPress(): void {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

function startLongPress(event: PointerEvent): void {
  if (!isTouchDevice || event.pointerType !== 'touch') {
    return
  }

  cancelLongPress()
  longPressTimer = setTimeout(() => {
    moreMenuRef.value?.show()
    longPressTimer = null
  }, 450)
}

// Received bubbles hug the left edge of the row, leaving open space to their
// right — so the triggers float just past the bubble's own right edge. Sent
// bubbles hug the right edge, so the triggers float past the bubble's left
// edge instead, keeping them inside the visible chat area on both sides. The
// "more options" trigger sits one slot further out than the reaction one.
const reactionTriggerStyle = computed(() =>
  props.isOwn ? { left: '-34px' } : { right: '-34px' },
)

const moreOptionsTriggerStyle = computed(() =>
  props.isOwn ? { left: '-68px' } : { right: '-68px' },
)

function confirmDelete(): void {
  $q.dialog({
    title: t('chat.deleteMessageTitle'),
    message: t('chat.deleteMessageConfirm'),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    chatSocket.deleteMessage(props.message.id)
  })
}

const replyToPreviewText = computed(() => {
  const replyTo = props.message.replyTo

  if (!replyTo) {
    return ''
  }

  return replyTo.content && replyTo.content.trim().length > 0
    ? replyTo.content
    : t('chat.replyPreviewFallback')
})

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
  if (
    mimeType.includes('zip') ||
    mimeType.includes('rar') ||
    mimeType.includes('7z') ||
    mimeType.includes('tar') ||
    mimeType.includes('gzip')
  ) {
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
  <div
    class="message-bubble-root"
    :class="{ 'message-bubble-root--highlighted': highlighted }"
    @pointerdown="startLongPress"
    @pointerup="cancelLongPress"
    @pointerleave="cancelLongPress"
    @pointercancel="cancelLongPress"
  >
    <QChatMessage
      :sent="isOwn"
      :name="senderName"
      :bg-color="bubbleColor"
      :text-color="bubbleTextColor"
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

      <template #default>
        <div>
          <div v-if="message.replyTo" class="message-bubble__reply-quote">
            <p class="message-bubble__reply-quote-name">{{ message.replyTo.senderName }}</p>
            <p class="message-bubble__reply-quote-content">{{ replyToPreviewText }}</p>
          </div>

          <div v-if="message.attachments.length > 0" class="flex flex-col gap-2">
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

        <button
          v-if="!isCompactActions"
          type="button"
          class="message-bubble__react-trigger"
          :class="{ 'message-bubble__react-trigger--active': isReactionMenuOpen }"
          :style="reactionTriggerStyle"
          :aria-label="t('chat.addReaction')"
        >
          <QIcon name="add_reaction" size="16px" />

          <QMenu
            ref="reactionMenuRef"
            anchor="top middle"
            self="bottom middle"
            :offset="[0, 10]"
            square
            class="reaction-dock-menu"
            @show="isReactionMenuOpen = true"
            @hide="isReactionMenuOpen = false"
          >
            <div class="reaction-dock">
              <button
                v-for="emoji in QUICK_REACTIONS"
                :key="emoji"
                type="button"
                class="reaction-dock__emoji"
                @click="handleReactionClick(emoji)"
              >
                <span>{{ emoji }}</span>
              </button>

              <EmojiPicker
                icon="add"
                color="white"
                size="14px"
                trigger-class="reaction-dock__more"
                @select="handleReactionClick"
              />
            </div>
          </QMenu>
        </button>

        <button
          type="button"
          class="message-bubble__more-trigger"
          :class="{ 'message-bubble__more-trigger--active': isMoreMenuOpen }"
          :style="isCompactActions ? reactionTriggerStyle : moreOptionsTriggerStyle"
          :aria-label="t('chat.messageActions')"
        >
          <QIcon name="more_vert" size="16px" />

          <QMenu
            ref="moreMenuRef"
            anchor="top middle"
            self="bottom middle"
            :offset="[0, 10]"
            @show="isMoreMenuOpen = true"
            @hide="isMoreMenuOpen = false"
          >
            <QList dense class="py-1 message-bubble__actions-list">
              <template v-if="isCompactActions">
                <div class="reaction-dock reaction-dock--inline">
                  <button
                    v-for="emoji in QUICK_REACTIONS"
                    :key="emoji"
                    type="button"
                    class="reaction-dock__emoji"
                    @click="handleReactionClickFromMoreMenu(emoji)"
                  >
                    <span>{{ emoji }}</span>
                  </button>

                  <EmojiPicker
                    icon="add"
                    color="white"
                    size="14px"
                    trigger-class="reaction-dock__more"
                    @select="handleReactionClickFromMoreMenu"
                  />
                </div>

                <QSeparator spaced />
              </template>

              <QItem v-close-popup clickable @click="emit('reply')">
                <QItemSection avatar class="min-w-0 pr-0">
                  <QIcon name="reply" size="18px" />
                </QItemSection>
                <QItemSection>{{ t('chat.replyAction') }}</QItemSection>
              </QItem>

              <QItem v-if="isOwn" v-close-popup clickable @click="emit('edit')">
                <QItemSection avatar class="min-w-0 pr-0">
                  <QIcon name="edit" size="18px" />
                </QItemSection>
                <QItemSection>{{ t('chat.editAction') }}</QItemSection>
              </QItem>

              <QItem v-if="isOwn" v-close-popup clickable @click="confirmDelete">
                <QItemSection avatar class="min-w-0 pr-0">
                  <QIcon name="delete_forever" size="18px" color="negative" />
                </QItemSection>
                <QItemSection class="text-negative">{{ t('chat.deleteAction') }}</QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </button>
      </template>
    </QChatMessage>

    <div
      v-if="reactionSummary.length > 0"
      class="flex"
      :class="isOwn ? 'justify-end' : 'justify-start'"
    >
      <div class="message-bubble__reactions flex flex-wrap gap-1">
        <button
          v-for="item in reactionSummary"
          :key="item.emoji"
          type="button"
          class="message-bubble__reaction-chip"
          :class="{ 'message-bubble__reaction-chip--mine': item.mine }"
          @click="handleReactionClick(item.emoji)"
        >
          <span>{{ item.emoji }}</span>
          <span class="text-xs">{{ item.count }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-bubble__receipt {
  vertical-align: middle;
}

.message-bubble__receipt--read {
  color: hsl(180, 93%, 50%);
  text-shadow: 0 0 1px rgb(0, 0, 0);
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

/*
 * The reaction quick-picker is rendered by QMenu into a teleported portal
 * (attached to <body>), so it is never clipped by the chat list's scroll
 * container. Styled as a floating WhatsApp-style "dock": a compact rounded
 * pill that hovers above the message instead of a boxy menu card.
 */
.reaction-dock-menu {
  background: transparent;
  box-shadow: none;
  /*
   * Quasar's position engine clamps the menu with an inline max-height +
   * overflow-y: auto when the trigger sits close to the real browser
   * viewport edge, cutting the pill flat instead of letting it float free.
   * Overriding with !important beats that inline style so the dock always
   * renders at full height.
   */
  max-height: none !important;
  overflow: visible !important;
}

.reaction-dock {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 10px;
  max-width: calc(100vw - 24px);
  border-radius: 999px;
  background-color: #232323;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.reaction-dock__emoji {
  border: none;
  background: transparent;
  font-size: 26px;
  line-height: 1;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.12s ease, transform 0.12s ease;
}

.reaction-dock__emoji:hover {
  background-color: rgba(255, 255, 255, 0.12);
  transform: scale(1.2) translateY(-2px);
}

.reaction-dock__more {
  margin-left: 2px;
  background-color: #4a4a4a !important;
  width: 32px;
  height: 32px;
}

.reaction-dock__more:hover {
  background-color: #5a5a5a !important;
}

/*
 * On touch devices the reaction dock is folded into the "more options" menu
 * instead of floating as its own dark pill, so it needs to blend into the
 * QMenu/QList card instead of standing out as a dark capsule.
 */
.message-bubble__actions-list {
  min-width: 220px;
}

.reaction-dock--inline {
  background: transparent;
  box-shadow: none;
  max-width: none;
  flex-wrap: nowrap;
  padding: 4px 12px 8px;
  overflow-x: auto;
}

.reaction-dock--inline .reaction-dock__emoji {
  width: 34px;
  height: 34px;
  font-size: 22px;
}

.reaction-dock--inline .reaction-dock__emoji:hover {
  background-color: rgba(0, 0, 0, 0.06);
}

.body--dark .reaction-dock--inline .reaction-dock__emoji:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/*
 * Rendered through the #stamp slot, which lives inside `.q-message-text`
 * (the actual colored bubble). Quasar already gives `.q-message-text`
 * `position: relative` out of the box, so this button can be absolutely
 * positioned against the bubble's own edge (left/right offset is set inline
 * via `reactionTriggerStyle`, based on which side the bubble hugs) instead
 * of floating far off at the edge of the whole chat row. Hidden by default
 * and revealed only while hovering the bubble itself.
 */
.message-bubble__react-trigger {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 999px;
  background-color: rgba(0, 0, 0, 0.35);
  color: #ffffff;
  cursor: pointer;
  opacity: 0;
  transform: translateY(-50%) scale(0.85);
  transition: opacity 0.15s ease, transform 0.15s ease, background-color 0.12s ease;
}

.body--dark .message-bubble__react-trigger {
  background-color: rgba(255, 255, 255, 0.15);
}

.message-bubble__react-trigger:hover {
  background-color: rgba(0, 0, 0, 0.55);
}

.body--dark .message-bubble__react-trigger:hover {
  background-color: rgba(255, 255, 255, 0.28);
}

:deep(.q-message-text:hover) .message-bubble__react-trigger,
.message-bubble__react-trigger--active {
  opacity: 1;
  transform: translateY(-50%) scale(1);
}

/* Same floating pattern as .message-bubble__react-trigger, one slot further out. */
.message-bubble__more-trigger {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 999px;
  background-color: rgba(0, 0, 0, 0.35);
  color: #ffffff;
  cursor: pointer;
  opacity: 0;
  transform: translateY(-50%) scale(0.85);
  transition: opacity 0.15s ease, transform 0.15s ease, background-color 0.12s ease;
}

.body--dark .message-bubble__more-trigger {
  background-color: rgba(255, 255, 255, 0.15);
}

.message-bubble__more-trigger:hover {
  background-color: rgba(0, 0, 0, 0.55);
}

.body--dark .message-bubble__more-trigger:hover {
  background-color: rgba(255, 255, 255, 0.28);
}

:deep(.q-message-text:hover) .message-bubble__more-trigger,
.message-bubble__more-trigger--active {
  opacity: 1;
  transform: translateY(-50%) scale(1);
}

/*
 * `:hover` never fires on touch screens, so the reaction/more-options
 * triggers would otherwise be permanently invisible on phones and tablets.
 * `(hover: none)` reliably detects that case and keeps them visible (at a
 * slightly lower resting opacity so they don't compete with the text).
 */
@media (hover: none) {
  .message-bubble__react-trigger,
  .message-bubble__more-trigger {
    opacity: 0.85;
    transform: translateY(-50%) scale(1);
  }
}

.message-bubble__reply-quote {
  border-left: 3px solid currentColor;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.12);
  padding: 4px 8px;
  margin-bottom: 4px;
}

.body--dark .message-bubble__reply-quote {
  background-color: rgba(255, 255, 255, 0.12);
}

.message-bubble__reply-quote-name {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
}

.message-bubble__reply-quote-content {
  margin: 0;
  font-size: 13px;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-bubble__reactions {
  margin-top: 2px;
}

.message-bubble__reaction-chip {
  display: flex;
  align-items: center;
  gap: 2px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 13px;
  background-color: rgba(0, 0, 0, 0.03);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.body--dark .message-bubble__reaction-chip {
  border-color: rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.05);
}

.message-bubble__reaction-chip--mine {
  border-color: var(--q-primary);
  background-color: color-mix(in srgb, var(--q-primary) 15%, transparent);
}

.message-bubble-root--highlighted :deep(.q-message-text) {
  animation: message-bubble-highlight-flash 1.6s ease;
}

@keyframes message-bubble-highlight-flash {
  0%,
  100% {
    box-shadow: none;
  }
  20% {
    box-shadow: 0 0 0 3px var(--q-primary);
  }
}
</style>
