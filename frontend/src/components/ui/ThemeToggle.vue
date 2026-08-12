<script setup lang="ts">
import { QBtn, QTooltip } from 'quasar'
import { useI18n } from 'vue-i18n'

import { useTheme } from '@/composables/useTheme'

const { isDark, toggle } = useTheme()
const { t } = useI18n()
</script>

<template>
  <QBtn
    round
    unelevated
    :color="isDark ? 'accent' : 'primary'"
    :icon="isDark ? 'dark_mode' : 'light_mode'"
    @click="toggle"
  >
    <QTooltip>{{ isDark ? t('sidebar.themeDarkLabel') : t('sidebar.themeLightLabel') }}</QTooltip>
  </QBtn>
</template>
