<script setup lang="ts">
import { QSpinner } from 'quasar'

withDefaults(
  defineProps<{
    label?: string
    size?: string
  }>(),
  {
    label: undefined,
    size: '32px',
  },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2 p-6">
    <QSpinner color="primary" :size="size" />
    <p v-if="label" class="text-sm opacity-70">{{ label }}</p>
  </div>
</template>
