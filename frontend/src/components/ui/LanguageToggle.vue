<script setup lang="ts">
import { QBtn, QTooltip } from 'quasar'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

// The tooltip states the CURRENT language ("Español"/"English"), shown in
// that language itself on purpose (a Spanish speaker recognizes "Español"
// even if the interface were in English, and vice versa) — literal
// strings, not translation keys.
function toggleLocale(): void {
  locale.value = locale.value === 'es' ? 'en' : 'es'
}
</script>

<template>
  <QBtn
    unelevated
    rounded
    color="primary"
    :label="locale === 'es' ? 'ES' : 'EN'"
    @click="toggleLocale"
  >
    <QTooltip>{{ locale === 'es' ? 'Español' : 'English' }}</QTooltip>
  </QBtn>
</template>
