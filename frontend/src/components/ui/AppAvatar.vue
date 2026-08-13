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
  }>(),
  {
    src: undefined,
    alt: '',
    initials: undefined,
    size: '40px',
    color: 'primary',
    previewable: false,
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
</template>

<style scoped>
.app-avatar--previewable {
  transition: opacity 0.15s ease;
}

.app-avatar--previewable:hover,
.app-avatar--previewable:focus-visible {
  opacity: 0.85;
}
</style>
