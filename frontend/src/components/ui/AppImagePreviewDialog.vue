<script setup lang="ts">
import { QBtn, QDialog, QImg, QSpinnerDots } from 'quasar'
import { useI18n } from 'vue-i18n'

import { useImagePreview } from '@/composables/useImagePreview'

const { isOpen, imageUrl, imageAlt, closeImagePreview } = useImagePreview()
const { t } = useI18n()
</script>

<template>
  <QDialog v-model="isOpen" maximized transition-show="fade" transition-hide="fade">
    <div
      class="image-preview flex h-full w-full items-center justify-center"
      @click="closeImagePreview"
    >
      <QBtn
        round
        flat
        icon="close"
        size="lg"
        color="white"
        class="image-preview__close absolute right-4 top-4"
        :aria-label="t('imagePreview.close')"
        @click.stop="closeImagePreview"
      />

      <QImg
        v-if="imageUrl"
        :src="imageUrl"
        :alt="imageAlt"
        fit="contain"
        class="image-preview__image"
        @click.stop
      >
        <template #loading>
          <QSpinnerDots size="32px" color="white" />
        </template>
      </QImg>
    </div>
  </QDialog>
</template>

<style scoped>
.image-preview {
  background-color: rgba(0, 0, 0, 0.85);
  cursor: zoom-out;
}

.image-preview__image {
  max-height: 90vh;
  max-width: 90vw;
  cursor: default;
}

.image-preview__close {
  z-index: 1;
}
</style>
