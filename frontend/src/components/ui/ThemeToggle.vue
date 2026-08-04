<script setup lang="ts">
import { QBtn } from 'quasar'

import { useTheme } from '@/composables/useTheme'

const { isDark, toggle } = useTheme()
</script>

<template>
  <QBtn
    round
    unelevated
    :color="isDark ? 'accent' : 'primary'"
    :icon="isDark ? 'light_mode' : 'dark_mode'"
    @click="toggle"
  />
</template>
