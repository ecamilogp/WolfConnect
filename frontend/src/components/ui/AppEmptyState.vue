<script setup lang="ts">
import { QIcon } from 'quasar'

withDefaults(
  defineProps<{
    icon?: string
    title: string
    description?: string
  }>(),
  {
    icon: 'pets',
    description: undefined,
  },
)
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 p-8 text-center">
    <QIcon :name="icon" size="48px" color="secondary" />
    <p class="text-lg font-semibold">{{ title }}</p>
    <p v-if="description" class="text-sm opacity-70">{{ description }}</p>
    <slot name="action" />
  </div>
</template>
