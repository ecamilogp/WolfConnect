<script setup lang="ts">
import { ref } from 'vue'
import { QBtn, QInput } from 'quasar'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{ send: [content: string] }>()

const { t } = useI18n()

const content = ref('')

function handleSubmit(): void {
  const trimmed = content.value.trim()

  if (trimmed.length === 0) {
    return
  }

  emit('send', trimmed)
  content.value = ''
}
</script>

<template>
  <form
    class="flex items-end gap-2 border-t border-black/20 px-4 py-3 dark:border-white/20"
    @submit.prevent="handleSubmit"
  >
    <QInput
      v-model="content"
      class="flex-1"
      dense
      outlined
      rounded
      autogrow
      :placeholder="t('chat.messagePlaceholder')"
      @keydown.enter.exact.prevent="handleSubmit"
    />

    <QBtn round unelevated color="primary" icon="send" type="submit" />
  </form>
</template>
