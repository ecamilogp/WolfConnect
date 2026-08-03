<script setup lang="ts">
import { QAvatar, QImg } from 'quasar'

withDefaults(
  defineProps<{
    src?: string
    alt?: string
    initials?: string
    size?: string
    color?: string
  }>(),
  {
    src: undefined,
    alt: '',
    initials: undefined,
    size: '40px',
    color: 'primary',
  },
)
</script>

<template>
  <QAvatar :size="size" :color="src ? undefined : color" text-color="white">
    <QImg v-if="src" :src="src" :alt="alt" />
    <span v-else>{{ initials }}</span>
  </QAvatar>
</template>
