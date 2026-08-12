<script setup lang="ts">
import { ref } from 'vue'
import { QBtn } from 'quasar'

import AppAvatar from './AppAvatar.vue'

withDefaults(
  defineProps<{
    src?: string
    initials?: string
    size?: string
    loading?: boolean
    label?: string
  }>(),
  {
    src: undefined,
    initials: undefined,
    size: '96px',
    loading: false,
    label: undefined,
  },
)

const emit = defineEmits<{ select: [file: File] }>()

const inputRef = ref<HTMLInputElement | null>(null)

function openPicker(): void {
  inputRef.value?.click()
}

function onFileChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    emit('select', file)
  }

  target.value = ''
}
</script>

<template>
  <div class="app-avatar-upload relative inline-flex" :class="{ 'opacity-70': loading }">
    <AppAvatar :src="src" :initials="initials" :size="size" />

    <QBtn
      round
      unelevated
      size="sm"
      color="primary"
      icon="photo_camera"
      class="app-avatar-upload__button absolute -bottom-1 -right-1"
      :loading="loading"
      :disable="loading"
      :aria-label="label"
      @click="openPicker"
    />

    <input
      ref="inputRef"
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif"
      class="hidden"
      :aria-label="label"
      @change="onFileChange"
    />
  </div>
</template>

<style scoped>
.app-avatar-upload__button {
  border: 2px solid white;
}

.body--dark .app-avatar-upload__button {
  border-color: var(--q-dark);
}
</style>
