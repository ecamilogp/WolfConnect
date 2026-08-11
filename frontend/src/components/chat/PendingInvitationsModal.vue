<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  QBtn,
  QCard,
  QCardSection,
  QDialog,
  QIcon,
  QItem,
  QItemSection,
  QList,
  QSeparator,
  QSpinnerDots,
} from 'quasar'
import { useI18n } from 'vue-i18n'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import { useGroupStore } from '@/stores/group.store'
import { useAppNotify } from '@/composables/useAppNotify'
import type { PendingInvitation } from '@/types/models/group.model'

const isOpen = defineModel<boolean>({ default: false })

const { t } = useI18n()
const { notifySuccess, notifyError } = useAppNotify()
const groupStore = useGroupStore()

const processingId = ref<string | null>(null)

watch(isOpen, (open) => {
  if (open) {
    groupStore.fetchPendingInvitations()
  }
})

async function handleAccept(invitation: PendingInvitation): Promise<void> {
  processingId.value = invitation.id

  try {
    await groupStore.acceptInvitation(invitation.id)
    notifySuccess('groups.acceptSuccessNotify')
  } catch (error) {
    notifyError(error, 'groups.actionError')
  } finally {
    processingId.value = null
  }
}

async function handleReject(invitation: PendingInvitation): Promise<void> {
  processingId.value = invitation.id

  try {
    await groupStore.rejectInvitation(invitation.id)
    notifySuccess('groups.rejectSuccessNotify')
  } catch (error) {
    notifyError(error, 'groups.actionError')
  } finally {
    processingId.value = null
  }
}
</script>

<template>
  <QDialog v-model="isOpen">
    <QCard class="w-full max-w-sm rounded-2xl">
      <QCardSection class="flex items-center gap-3 pb-2 pt-4">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-violet/10 text-brand-violet dark:bg-brand-amber/15 dark:text-brand-amber"
        >
          <QIcon name="mail" size="22px" />
        </div>

        <p class="min-w-0 flex-1 text-lg font-semibold leading-tight translate-y-2">
          {{ t('groups.pendingInvitationsTitle') }}
        </p>

        <QBtn
          v-close-popup
          round
          flat
          dense
          icon="close"
          size="sm"
          :aria-label="t('groups.close')"
        />
      </QCardSection>

      <QSeparator />

      <QCardSection class="max-h-96 overflow-y-auto p-0">
        <div v-if="groupStore.isPendingInvitationsLoading" class="flex justify-center py-6">
          <QSpinnerDots size="32px" color="primary" />
        </div>

        <p
          v-else-if="groupStore.pendingInvitations.length === 0"
          class="p-6 text-center text-sm opacity-70"
        >
          {{ t('groups.noPendingInvitations') }}
        </p>

        <QList v-else separator>
          <QItem v-for="invitation in groupStore.pendingInvitations" :key="invitation.id">
            <QItemSection avatar>
              <AppAvatar
                :src="invitation.groupImageUrl ?? undefined"
                :initials="(invitation.groupName || '?').charAt(0).toUpperCase()"
                size="36px"
              />
            </QItemSection>

            <QItemSection>
              <p class="text-sm translate-2">
                <span class="font-semibold">{{ invitation.invitedByName }}</span>
                {{ t('groups.invitedYouTo') }}
                <span class="font-semibold">"{{ invitation.groupName }}"</span>
              </p>
            </QItemSection>

            <QItemSection side>
              <div class="flex gap-1">
                <QBtn
                  round
                  flat
                  dense
                  color="positive"
                  icon="check"
                  :loading="processingId === invitation.id"
                  @click="handleAccept(invitation)"
                />
                <QBtn
                  round
                  flat
                  dense
                  color="negative"
                  icon="close"
                  :loading="processingId === invitation.id"
                  @click="handleReject(invitation)"
                />
              </div>
            </QItemSection>
          </QItem>
        </QList>
      </QCardSection>
    </QCard>
  </QDialog>
</template>
