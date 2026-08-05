<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  QCard,
  QCardSection,
  QDialog,
  QIcon,
  QInput,
  QItem,
  QItemSection,
  QList,
  QSeparator,
  QSpinnerDots,
} from 'quasar'
import { useI18n } from 'vue-i18n'
import { refDebounced } from '@vueuse/core'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import { searchUsers } from '@/services/http/user.service'
import type { UserSearchResult } from '@/types/models/user-search-result.model'

const isOpen = defineModel<boolean>({ default: false })

const emit = defineEmits<{ select: [userId: string] }>()

const { t } = useI18n()

const query = ref('')
const debouncedQuery = refDebounced(query, 350)
const results = ref<UserSearchResult[]>([])
const isSearching = ref(false)

function initials(user: UserSearchResult): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

watch(debouncedQuery, async (value) => {
  const trimmed = value.trim()

  if (trimmed.length === 0) {
    results.value = []
    return
  }

  isSearching.value = true

  try {
    results.value = await searchUsers(trimmed)
  } finally {
    isSearching.value = false
  }
})

watch(isOpen, (open) => {
  if (!open) {
    query.value = ''
    results.value = []
  }
})

function handleSelect(user: UserSearchResult): void {
  emit('select', user.id)
  isOpen.value = false
}
</script>

<template>
  <QDialog v-model="isOpen">
    <QCard class="w-full max-w-sm">
      <QCardSection>
        <QInput
          v-model="query"
          autofocus
          dense
          outlined
          rounded
          :placeholder="t('chat.searchUsersPlaceholder')"
        >
          <template #prepend>
            <QIcon name="search" size="18px" />
          </template>
        </QInput>
      </QCardSection>

      <QSeparator />

      <QCardSection class="max-h-80 overflow-y-auto p-0">
        <div v-if="isSearching" class="flex justify-center py-6">
          <QSpinnerDots size="32px" color="primary" />
        </div>

        <p
          v-else-if="query.trim().length > 0 && results.length === 0"
          class="p-6 text-center text-sm opacity-70"
        >
          {{ t('chat.noUsersFound') }}
        </p>

        <QList v-else separator>
          <QItem v-for="user in results" :key="user.id" clickable @click="handleSelect(user)">
            <QItemSection avatar>
              <AppAvatar :src="user.profileImage ?? undefined" :initials="initials(user)" size="36px" />
            </QItemSection>

            <QItemSection>
              {{ user.firstName }} {{ user.lastName }}
              <span class="text-xs text-gray-500 dark:text-gray-400"> — {{ user.username }}</span>
            </QItemSection>
          </QItem>
        </QList>
      </QCardSection>
    </QCard>
  </QDialog>
</template>
