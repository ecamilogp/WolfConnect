<script setup lang="ts">
import { computed } from 'vue'
import { QBtn, QChip, QIcon, QItem, QItemSection, QList, QMenu } from 'quasar'
import { useI18n } from 'vue-i18n'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import { usePresenceStore } from '@/stores/presence.store'
import type { GroupParticipant } from '@/types/models/group.model'

export interface GroupMemberAction {
  label: string
  icon: string
  handler: () => void
}

const props = defineProps<{
  participant: GroupParticipant
  isYou: boolean
  actions: GroupMemberAction[]
}>()

const { t } = useI18n()
const presenceStore = usePresenceStore()

const isOnline = computed(() => presenceStore.isOnline(props.participant.userId))

function initials(): string {
  return `${props.participant.firstName.charAt(0)}${props.participant.lastName.charAt(0)}`.toUpperCase()
}

function roleLabel(): string {
  if (props.participant.role === 'OWNER') {
    return t('groups.roleOwner')
  }

  if (props.participant.role === 'ADMIN') {
    return t('groups.roleAdmin')
  }

  return t('groups.roleMember')
}

function roleIcon(): string {
  if (props.participant.role === 'OWNER') {
    return 'workspace_premium'
  }

  if (props.participant.role === 'ADMIN') {
    return 'shield'
  }

  return 'person'
}

function roleColor(): string {
  if (props.participant.role === 'OWNER') {
    return 'primary'
  }

  if (props.participant.role === 'ADMIN') {
    return 'grey-7'
  }

  return 'grey-5'
}
</script>

<template>
  <QItem class="py-2.5">
    <QItemSection avatar>
      <AppAvatar
        :src="participant.profileImage ?? undefined"
        :initials="initials()"
        size="40px"
        :online="isOnline"
      />
    </QItemSection>

    <QItemSection class="flex flex-row items-center">
      <p class="flex items-center gap-1.5 text-sm font-medium leading-tight">
        <span class="truncate translate-y-2"
          >{{ participant.firstName }} {{ participant.lastName }}</span
        >
        <QChip v-if="isYou" outline color="primary" size="sm" class="translate-y-2">
          {{ t('groups.you') }}
        </QChip>
      </p>
    </QItemSection>

    <QItemSection side>
      <div class="flex items-center gap-2.5">
        <QChip
          :icon="roleIcon()"
          :color="roleColor()"
          text-color="white"
          class="px-3 py-1 text-xs font-semibold tracking-wide"
        >
          {{ roleLabel() }}
        </QChip>

        <QBtn
          v-if="actions.length > 0"
          round
          flat
          dense
          icon="more_vert"
          size="sm"
          :aria-label="t('groups.memberActions')"
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
                  <QIcon :name="action.icon" size="18px" />
                </QItemSection>
                <QItemSection>{{ action.label }}</QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </QBtn>
      </div>
    </QItemSection>
  </QItem>
</template>
