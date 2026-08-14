<script setup lang="ts">
import { QBtn } from 'quasar'

withDefaults(
  defineProps<{
    label?: string
    color?: string
    outline?: boolean
    loading?: boolean
    disabled?: boolean
    icon?: string
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    label: undefined,
    color: 'primary',
    outline: false,
    loading: false,
    disabled: false,
    icon: undefined,
    type: 'button',
  },
)

defineEmits<{ click: [event: Event] }>()
</script>

<template>
  <QBtn
    :label="label"
    :color="color"
    :outline="outline"
    :loading="loading"
    :disable="disabled"
    :icon="icon"
    :type="type"
    unelevated
    rounded
    @click="(event: Event) => $emit('click', event)"
  />
</template>
