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
    <p
      v-if="description"
      class="text-sm bg-gray-200 rounded-2xl p-1.5 -translate-y-3 opacity-90 text-black"
    >
      {{ description }}
    </p>
    <slot name="action" />
  </div>
</template>
