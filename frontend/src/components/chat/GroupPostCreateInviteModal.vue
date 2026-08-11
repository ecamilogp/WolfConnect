<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  QBtn,
  QCard,
  QCardActions,
  QCardSection,
  QChip,
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

import AppAvatar from '@/components/ui/AppAvatar.vue'
import { inviteToGroup } from '@/services/http/group.service'
import { useAppNotify } from '@/composables/useAppNotify'
import { useUserSearch } from '@/composables/useUserSearch'
import type { GroupJoinPolicy } from '@/types/models/chat.model'
import type { UserSearchResult } from '@/types/models/user-search-result.model'

const props = defineProps<{ chatId: string | null; joinPolicy: GroupJoinPolicy | null }>()

const isOpen = defineModel<boolean>({ default: false })

const { t } = useI18n()
const { notifySuccess, notifyError } = useAppNotify()

const { query, results, isSearching, reset: resetSearch } = useUserSearch()
const selectedUsers = ref<UserSearchResult[]>([])
const isSubmitting = ref(false)

const filteredResults = computed(() =>
  results.value.filter((user) => !selectedUsers.value.some((selected) => selected.id === user.id)),
)

const isAutoAdd = computed(() => props.joinPolicy === 'AUTO_ADD')

const title = computed(() =>
  isAutoAdd.value ? t('groups.postCreateTitleAutoAdd') : t('groups.postCreateTitleInvite'),
)

const icon = computed(() => (isAutoAdd.value ? 'person_add' : 'mail'))

const submitLabel = computed(() =>
  isAutoAdd.value ? t('groups.addMembersSubmit') : t('groups.sendInvitationsSubmit'),
)

function initials(user: UserSearchResult): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
}

watch(isOpen, (open) => {
  if (!open) {
    resetSearch()
    selectedUsers.value = []
  }
})

function addUser(user: UserSearchResult): void {
  selectedUsers.value.push(user)
  resetSearch()
}

function removeUser(userId: string): void {
  selectedUsers.value = selectedUsers.value.filter((user) => user.id !== userId)
}

async function handleSubmit(): Promise<void> {
  if (!props.chatId || selectedUsers.value.length === 0) {
    isOpen.value = false
    return
  }

  isSubmitting.value = true

  const chatId = props.chatId
  const outcomes = await Promise.allSettled(
    selectedUsers.value.map((user) => inviteToGroup(chatId, user.id)),
  )

  isSubmitting.value = false

  const hasFailures = outcomes.some((outcome) => outcome.status === 'rejected')

  if (hasFailures) {
    notifyError(null, 'groups.postCreateError')
    return
  }

  notifySuccess(isAutoAdd.value ? 'groups.membersAddedNotify' : 'groups.invitationsSentNotify')
  isOpen.value = false
}
</script>

<template>
  <QDialog v-model="isOpen">
    <QCard class="w-full max-w-md rounded-2xl">
      <QCardSection class="flex items-start gap-3 pb-2 pt-4">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-violet/10 text-brand-violet dark:bg-brand-amber/15 dark:text-brand-amber"
        >
          <QIcon :name="icon" size="22px" />
        </div>

        <div class="min-w-0 flex-1 pt-0.5">
          <p class="text-lg font-semibold leading-tight">{{ title }}</p>
          <p class="text-sm opacity-60">{{ t('groups.postCreateSubtitle') }}</p>
        </div>

        <QBtn
          round
          flat
          dense
          icon="close"
          size="sm"
          :aria-label="t('groups.skipForNow')"
          @click="isOpen = false"
        />
      </QCardSection>

      <QCardSection class="flex flex-col gap-3 pt-2">
        <div v-if="selectedUsers.length > 0" class="flex flex-wrap gap-2">
          <QChip
            v-for="user in selectedUsers"
            :key="user.id"
            removable
            color="primary"
            text-color="white"
            @remove="removeUser(user.id)"
          >
            {{ user.firstName }} {{ user.lastName }}
          </QChip>
        </div>

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

      <QCardSection class="max-h-64 overflow-y-auto p-0">
        <div v-if="isSearching" class="flex justify-center py-6">
          <QSpinnerDots size="28px" color="primary" />
        </div>

        <p
          v-else-if="query.trim().length > 0 && filteredResults.length === 0"
          class="p-6 text-center text-sm opacity-60"
        >
          {{ t('chat.noUsersFound') }}
        </p>

        <QList v-else-if="filteredResults.length > 0" separator>
          <QItem v-for="user in filteredResults" :key="user.id" clickable @click="addUser(user)">
            <QItemSection avatar>
              <AppAvatar
                :src="user.profileImage ?? undefined"
                :initials="initials(user)"
                size="36px"
              />
            </QItemSection>

            <QItemSection>
              {{ user.firstName }} {{ user.lastName }}
              <span class="text-xs text-gray-500 dark:text-gray-400"> — {{ user.username }}</span>
            </QItemSection>

            <QItemSection side>
              <QIcon name="add_circle_outline" size="20px" class="opacity-60" />
            </QItemSection>
          </QItem>
        </QList>
      </QCardSection>

      <QCardActions align="right" class="gap-2 px-4 pb-4">
        <QBtn flat rounded :label="t('groups.skipForNow')" @click="isOpen = false" />
        <QBtn
          unelevated
          rounded
          color="primary"
          :label="submitLabel"
          :disable="selectedUsers.length === 0"
          :loading="isSubmitting"
          @click="handleSubmit"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>
