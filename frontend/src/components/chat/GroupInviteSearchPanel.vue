<script setup lang="ts">
import { QIcon, QInput, QItem, QItemSection, QList, QSpinnerDots } from 'quasar'
import { useI18n } from 'vue-i18n'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import type { UserSearchResult } from '@/types/models/user-search-result.model'

defineProps<{ results: UserSearchResult[]; isLoading: boolean }>()

const emit = defineEmits<{ select: [user: UserSearchResult]; close: [] }>()

const query = defineModel<string>('query', { default: '' })

const { t } = useI18n()

function initials(user: UserSearchResult): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}
</script>

<template>
  <div>
    <QInput v-model="query" autofocus dense outlined rounded :placeholder="t('chat.searchUsersPlaceholder')">
      <template #prepend>
        <QIcon name="search" size="18px" />
      </template>

      <template #append>
        <QIcon name="close" size="18px" class="cursor-pointer" @click="emit('close')" />
      </template>
    </QInput>

    <div v-if="isLoading" class="flex justify-center py-4">
      <QSpinnerDots size="24px" color="primary" />
    </div>

    <p v-else-if="query.trim().length > 0 && results.length === 0" class="py-4 text-center text-sm opacity-60">
      {{ t('chat.noUsersFound') }}
    </p>

    <QList v-else separator class="rounded-lg">
      <QItem v-for="user in results" :key="user.id" clickable @click="emit('select', user)">
        <QItemSection avatar>
          <AppAvatar :src="user.profileImage ?? undefined" :initials="initials(user)" size="32px" />
        </QItemSection>

        <QItemSection>
          {{ user.firstName }} {{ user.lastName }}
          <span class="text-xs opacity-60"> — {{ user.username }}</span>
        </QItemSection>

        <QItemSection side>
          <QIcon name="add_circle_outline" size="20px" class="opacity-60" />
        </QItemSection>
      </QItem>
    </QList>
  </div>
</template>
