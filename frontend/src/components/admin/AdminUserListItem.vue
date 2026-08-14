<script setup lang="ts">
import { computed } from 'vue'
import { QBtn, QChip, QItem, QItemSection, QTooltip } from 'quasar'
import { useI18n } from 'vue-i18n'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import AppActionMenu from '@/components/ui/AppActionMenu.vue'
import type { AppActionMenuAction } from '@/components/ui/AppActionMenu.vue'
import { getInitialsFromName } from '@/utils/initials'
import type { User } from '@/types/models/user.model'

export type AdminUserAction = AppActionMenuAction

const props = defineProps<{
  user: User
  isYou: boolean
  isUpdatingRole: boolean
  isUpdatingStatus: boolean
  actions: AdminUserAction[]
}>()

const emit = defineEmits<{ toggleRole: [] }>()

const { t } = useI18n()

const initials = computed(() => getInitialsFromName(props.user.firstName, props.user.lastName))

const isAdmin = computed(() => props.user.role === 'ADMIN')

const roleLabel = computed(() => (isAdmin.value ? t('admin.roleAdmin') : t('admin.roleUser')))

const toggleLabel = computed(() =>
  isAdmin.value ? t('admin.demoteAction') : t('admin.promoteAction'),
)

const statusLabel = computed(() => {
  if (props.user.status === 'BLOCKED') {
    return t('admin.statusBlocked')
  }

  if (props.user.status === 'INACTIVE') {
    return t('admin.statusInactive')
  }

  return t('admin.statusActive')
})

const statusColor = computed(() => {
  if (props.user.status === 'BLOCKED') {
    return 'negative'
  }

  if (props.user.status === 'INACTIVE') {
    return 'grey-6'
  }

  return 'positive'
})
</script>

<template>
  <QItem class="py-2.5">
    <QItemSection avatar>
      <AppAvatar :src="user.profileImage ?? undefined" :initials="initials" size="40px" />
    </QItemSection>

    <QItemSection>
      <p class="flex items-center gap-1.5 text-sm font-medium leading-tight">
        <span class="truncate translate-y-2">{{ user.firstName }} {{ user.lastName }}</span>
        <QChip v-if="isYou" outline color="primary" size="sm" class="translate-y-2">
          {{ t('admin.you') }}
        </QChip>
      </p>
      <p class="truncate text-xs opacity-60">{{ user.email }}</p>
    </QItemSection>

    <QItemSection side>
      <div class="flex items-center gap-2.5">
        <QChip
          :color="statusColor"
          text-color="white"
          class="px-3 py-1 text-xs font-semibold tracking-wide"
        >
          {{ statusLabel }}
        </QChip>

        <QChip
          :icon="isAdmin ? 'shield' : 'person'"
          :color="isAdmin ? 'primary' : 'grey-5'"
          text-color="white"
          class="px-3 py-1 text-xs font-semibold tracking-wide"
        >
          {{ roleLabel }}
        </QChip>

        <QBtn
          round
          flat
          dense
          size="sm"
          :icon="isAdmin ? 'remove_moderator' : 'add_moderator'"
          :loading="isUpdatingRole"
          :disable="isYou"
          :aria-label="toggleLabel"
          @click="emit('toggleRole')"
        >
          <QTooltip v-if="isYou">{{ t('admin.cannotChangeSelf') }}</QTooltip>
          <QTooltip v-else>{{ toggleLabel }}</QTooltip>
        </QBtn>

        <AppActionMenu
          :actions="actions"
          :loading="isUpdatingStatus"
          :trigger-label="t('admin.moreActions')"
        />
      </div>
    </QItemSection>
  </QItem>
</template>
