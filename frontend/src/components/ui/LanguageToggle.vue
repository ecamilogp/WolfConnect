<script setup lang="ts">
import { QBtn } from 'quasar'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

function toggleLocale(): void {
  locale.value = locale.value === 'es' ? 'en' : 'es'
}
</script>

<template>
  <QBtn
    unelevated
    rounded
    color="primary"
    :label="locale === 'es' ? 'EN' : 'ES'"
    @click="toggleLocale"
  />
</template>
