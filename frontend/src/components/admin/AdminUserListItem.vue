<script setup lang="ts">
import { computed } from 'vue'
import { QBtn, QChip, QIcon, QItem, QItemSection, QList, QMenu, QTooltip } from 'quasar'
import { useI18n } from 'vue-i18n'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import type { User } from '@/types/models/user.model'

export interface AdminUserAction {
  label: string
  icon: string
  color?: string
  handler: () => void
}

const props = defineProps<{
  user: User
  isYou: boolean
  isUpdatingRole: boolean
  isUpdatingStatus: boolean
  actions: AdminUserAction[]
}>()

const emit = defineEmits<{ toggleRole: [] }>()

const { t } = useI18n()

const initials = computed(() =>
  `${props.user.firstName.charAt(0)}${props.user.lastName.charAt(0)}`.toUpperCase(),
)

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

        <QBtn
          v-if="actions.length > 0"
          round
          flat
          dense
          size="sm"
          icon="more_vert"
          :loading="isUpdatingStatus"
          :aria-label="t('admin.moreActions')"
        >
          <QMenu anchor="bottom right" self="top right">
            <QList dense class="py-1">
              <QItem
                v-for="action in actions"
                :key="action.label"
                v-close-popup
                clickable
                @click="action.handler"
              >
                <QItemSection avatar class="min-w-0 pr-0">
                  <QIcon :name="action.icon" size="18px" :color="action.color" />
                </QItemSection>
                <QItemSection :class="action.color ? `text-${action.color}` : ''">
                  {{ action.label }}
                </QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </QBtn>
      </div>
    </QItemSection>
  </QItem>
</template>
