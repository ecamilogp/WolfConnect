<script setup lang="ts">
import { QAvatar, QImg } from 'quasar'
import { useI18n } from 'vue-i18n'

import { useImagePreview } from '@/composables/useImagePreview'

const props = withDefaults(
  defineProps<{
    src?: string
    alt?: string
    initials?: string
    size?: string
    color?: string
    previewable?: boolean
    online?: boolean
  }>(),
  {
    src: undefined,
    alt: '',
    initials: undefined,
    size: '40px',
    color: 'primary',
    previewable: false,
    online: false,
  },
)

const { t } = useI18n()
const { openImagePreview } = useImagePreview()

function handleClick(): void {
  if (props.previewable && props.src) {
    openImagePreview(props.src, props.alt)
  }
}
</script>

<template>
  <div class="app-avatar-root relative inline-block">
    <QAvatar
      :size="size"
      :color="src ? undefined : color"
      text-color="white"
      :class="{ 'app-avatar--previewable cursor-pointer': previewable && src }"
      :tabindex="previewable && src ? 0 : undefined"
      :role="previewable && src ? 'button' : undefined"
      :aria-label="previewable && src ? t('imagePreview.viewLabel') : undefined"
      @click="handleClick"
      @keydown.enter="handleClick"
    >
      <QImg v-if="src" :src="src" :alt="alt" ratio="1" fit="cover" class="h-full w-full" />
      <span v-else>{{ initials }}</span>
    </QAvatar>

    <span
      v-if="online"
      class="app-avatar__status-dot"
      role="status"
      :aria-label="t('presence.onlineLabel')"
    />
  </div>
</template>

<style scoped>
.app-avatar--previewable {
  transition: opacity 0.15s ease;
}

.app-avatar--previewable:hover,
.app-avatar--previewable:focus-visible {
  opacity: 0.85;
}

.app-avatar__status-dot {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 26%;
  height: 26%;
  min-width: 9px;
  min-height: 9px;
  border-radius: 999px;
  background-color: #2ecc71;
  border: 2px solid #faf8f8;
  box-sizing: content-box;
}

.body--dark .app-avatar__status-dot {
  border-color: #16151b;
}
</style>
