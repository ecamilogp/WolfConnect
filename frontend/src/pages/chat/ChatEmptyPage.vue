<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import AppEmptyState from '@/components/ui/AppEmptyState.vue'

const { t } = useI18n()
</script>

<template>
  <div class="flex h-full items-center justify-center">
    <AppEmptyState
      icon="forum"
      :title="t('chat.emptyStateTitle')"
      :description="t('chat.emptyStateDescription')"
    />
  </div>
</template>
