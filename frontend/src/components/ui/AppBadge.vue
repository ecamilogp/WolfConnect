<script setup lang="ts">
import { QBadge } from 'quasar'

withDefaults(
  defineProps<{
    label?: string | number
    color?: string
    outline?: boolean
    floating?: boolean
  }>(),
  {
    label: undefined,
    color: 'accent',
    outline: false,
    floating: false,
  },
)
</script>

<template>
  <QBadge :color="color" :outline="outline" :floating="floating" rounded>
    {{ label }}
  </QBadge>
</template>
