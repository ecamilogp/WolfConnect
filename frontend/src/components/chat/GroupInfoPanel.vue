<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import {
  QBtn,
  QCard,
  QCardActions,
  QCardSection,
  QDialog,
  QInput,
  QList,
  QSeparator,
  QSpinnerDots,
  useQuasar,
} from 'quasar'
import { useI18n } from 'vue-i18n'

import AppAvatar from '@/components/ui/AppAvatar.vue'
import GroupMemberListItem from '@/components/chat/GroupMemberListItem.vue'
import GroupInviteSearchPanel from '@/components/chat/GroupInviteSearchPanel.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useGroupStore } from '@/stores/group.store'
import { useChatSocket } from '@/composables/useChatSocket'
import { useUserSearch } from '@/composables/useUserSearch'
import { useAppNotify } from '@/composables/useAppNotify'
import type { GroupMemberAction } from '@/components/chat/GroupMemberListItem.vue'
import type { GroupParticipant } from '@/types/models/group.model'
import type { UserSearchResult } from '@/types/models/user-search-result.model'

const props = defineProps<{ chatId: string | null }>()

const isOpen = defineModel<boolean>({ default: false })

const emit = defineEmits<{ left: [chatId: string]; deleted: [chatId: string] }>()

const { t } = useI18n()
const $q = useQuasar()
const { notifySuccess, notifyError } = useAppNotify()
const authStore = useAuthStore()
const groupStore = useGroupStore()
const chatSocket = useChatSocket()

const isInviting = ref(false)
const {
  query: inviteQuery,
  results: inviteResults,
  isSearching: isSearchingUsers,
  reset: resetInviteSearch,
} = useUserSearch()
const isSendingInvite = ref(false)

const isEditing = ref(false)
const editName = ref('')
const editNameError = ref('')
const editDescription = ref('')
const isSavingEdit = ref(false)

const group = computed(() => groupStore.groupDetail)

const myRole = computed(() => {
  const currentUserId = authStore.user?.id

  return (
    group.value?.participants.find((participant) => participant.userId === currentUserId)?.role ??
    null
  )
})

const isOwner = computed(() => myRole.value === 'OWNER')
const canManage = computed(() => myRole.value === 'OWNER' || myRole.value === 'ADMIN')
const isAutoAdd = computed(() => group.value?.joinPolicy === 'AUTO_ADD')

function actionsFor(participant: GroupParticipant): GroupMemberAction[] {
  if (!props.chatId || participant.userId === authStore.user?.id) {
    return []
  }

  const chatId = props.chatId
  const actions: GroupMemberAction[] = []

  if (isOwner.value) {
    if (participant.role === 'MEMBER') {
      actions.push({
        label: t('groups.promote'),
        icon: 'upgrade',
        handler: () =>
          runAction(
            () => groupStore.promoteToAdmin(chatId, participant.userId),
            'groups.promoteSuccessNotify',
          ),
      })
    }

    if (participant.role === 'ADMIN') {
      actions.push({
        label: t('groups.demote'),
        icon: 'remove_moderator',
        handler: () =>
          runAction(
            () => groupStore.demoteAdmin(chatId, participant.userId),
            'groups.demoteSuccessNotify',
          ),
      })
      actions.push({
        label: t('groups.transferOwnership'),
        icon: 'workspace_premium',
        handler: () => confirmTransferOwnership(participant),
      })
    }

    actions.push({
      label: t('groups.remove'),
      icon: 'person_remove',
      handler: () => confirmRemoveParticipant(participant),
    })
  } else if (myRole.value === 'ADMIN' && participant.role === 'MEMBER') {
    actions.push({
      label: t('groups.remove'),
      icon: 'person_remove',
      handler: () => confirmRemoveParticipant(participant),
    })
  }

  return actions
}

async function runAction(action: () => Promise<void>, successKey?: string): Promise<void> {
  try {
    await action()

    if (successKey) {
      notifySuccess(successKey)
    }
  } catch (error) {
    notifyError(error, 'groups.actionError')
  }
}

function confirmRemoveParticipant(participant: GroupParticipant): void {
  if (!props.chatId) {
    return
  }

  const chatId = props.chatId

  $q.dialog({
    title: t('groups.remove'),
    message: t('groups.removeConfirm', {
      name: `${participant.firstName} ${participant.lastName}`,
    }),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    runAction(
      () => groupStore.removeParticipant(chatId, participant.userId),
      'groups.removeSuccessNotify',
    )
  })
}

function confirmTransferOwnership(participant: GroupParticipant): void {
  if (!props.chatId) {
    return
  }

  const chatId = props.chatId

  $q.dialog({
    title: t('groups.transferOwnership'),
    message: t('groups.transferOwnershipConfirm', {
      name: `${participant.firstName} ${participant.lastName}`,
    }),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    runAction(
      () => groupStore.transferOwnership(chatId, participant.userId),
      'groups.transferSuccessNotify',
    )
  })
}

function confirmLeaveGroup(): void {
  if (!props.chatId) {
    return
  }

  const chatId = props.chatId

  $q.dialog({
    title: t('groups.leaveButton'),
    message: t('groups.leaveConfirm'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await groupStore.leaveGroup(chatId)
      notifySuccess('groups.leaveSuccessNotify')
      isOpen.value = false
      emit('left', chatId)
    } catch (error) {
      notifyError(error, 'groups.actionError')
    }
  })
}

function confirmDeleteGroup(): void {
  if (!props.chatId) {
    return
  }

  const chatId = props.chatId

  $q.dialog({
    title: t('groups.deleteButton'),
    message: t('groups.deleteConfirm'),
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await groupStore.deleteGroup(chatId)
      notifySuccess('groups.deleteSuccessNotify')
      isOpen.value = false
      emit('deleted', chatId)
    } catch (error) {
      notifyError(error, 'groups.actionError')
    }
  })
}

function openInvite(): void {
  isInviting.value = true
  resetInviteSearch()
}

function closeInvite(): void {
  isInviting.value = false
}

async function handleInvite(user: UserSearchResult): Promise<void> {
  if (!props.chatId) {
    return
  }

  isSendingInvite.value = true

  try {
    await groupStore.inviteToGroup(props.chatId, user.id)
    notifySuccess(isAutoAdd.value ? 'groups.memberAddedNotify' : 'groups.inviteSentNotify')
    closeInvite()
  } catch (error) {
    notifyError(error, 'groups.actionError')
  } finally {
    isSendingInvite.value = false
  }
}

function startEditing(): void {
  if (!group.value) {
    return
  }

  editName.value = group.value.name ?? ''
  editDescription.value = group.value.description ?? ''
  editNameError.value = ''
  isEditing.value = true
}

function cancelEditing(): void {
  isEditing.value = false
}

async function saveEditing(): Promise<void> {
  if (!props.chatId) {
    return
  }

  const trimmedName = editName.value.trim()

  if (trimmedName.length < 3) {
    editNameError.value = t('groups.nameTooShort')
    return
  }

  editNameError.value = ''
  isSavingEdit.value = true

  try {
    await groupStore.updateGroup(props.chatId, {
      name: trimmedName,
      description: editDescription.value.trim() || undefined,
    })
    notifySuccess('groups.updateSuccessNotify')
    isEditing.value = false
  } catch (error) {
    notifyError(error, 'groups.actionError')
  } finally {
    isSavingEdit.value = false
  }
}

const unsubscribe = chatSocket.subscribe({
  onMessageNew: () => {},
  onMessageEdited: () => {},
  onMessageDeleted: () => {},
  onGroupUpdated: (chat) => groupStore.applyGroupUpdated(chat),
  onGroupRoleChanged: (payload) => groupStore.applyRoleChanged(payload),
  onGroupParticipantAdded: (payload) => groupStore.applyParticipantAdded(payload),
  onGroupParticipantRemoved: (payload) => groupStore.applyParticipantRemoved(payload),
  onGroupOwnershipTransferred: (payload) => groupStore.applyOwnershipTransferred(payload),
})

watch(isOpen, (open) => {
  isInviting.value = false
  isEditing.value = false

  if (open && props.chatId && groupStore.groupDetail?.id !== props.chatId) {
    groupStore.openGroupDetail(props.chatId)
  }
})

onUnmounted(() => {
  unsubscribe()
})
</script>

<template>
  <QDialog v-model="isOpen" :maximized="$q.screen.lt.sm">
    <QCard class="w-full max-w-md rounded-2xl">
      <QCardSection v-if="!group" class="flex justify-center py-10">
        <QSpinnerDots size="32px" color="primary" />
      </QCardSection>

      <template v-else>
        <QCardSection class="flex items-start gap-3 pb-2 pt-4">
          <AppAvatar
            :src="group.imageUrl ?? undefined"
            :initials="(group.name ?? '?').charAt(0).toUpperCase()"
            size="56px"
          />

          <div v-if="!isEditing" class="min-w-0 flex-1 pt-0.5">
            <p class="truncate text-lg font-semibold leading-tight translate-y-2">
              {{ group.name }}
            </p>
            <p
              v-if="group.description"
              class="mt-0.5 text-sm opacity-60 whitespace-pre-wrap wrap-break-word"
            >
              {{ group.description }}
            </p>
          </div>

          <div v-else class="flex flex-1 flex-col gap-2">
            <QInput
              v-model="editName"
              rounded
              :label="t('groups.nameLabel')"
              maxlength="100"
              :error="!!editNameError"
              :error-message="editNameError"
              @update:model-value="editNameError = ''"
            />
            <QInput
              v-model="editDescription"
              rounded
              type="textarea"
              autogrow
              rows="2"
              :label="t('groups.descriptionLabel')"
              maxlength="255"
            />
          </div>

          <div class="flex shrink-0 items-center gap-1">
            <QBtn
              v-if="canManage && !isEditing"
              round
              flat
              dense
              icon="edit"
              size="sm"
              :aria-label="t('groups.editGroup')"
              @click="startEditing"
            />
            <QBtn
              v-close-popup
              round
              flat
              dense
              icon="close"
              size="sm"
              :aria-label="t('groups.close')"
            />
          </div>
        </QCardSection>

        <QCardActions v-if="isEditing" align="right" class="gap-2 px-4">
          <QBtn flat rounded :label="t('groups.cancel')" @click="cancelEditing" />
          <QBtn
            unelevated
            rounded
            color="primary"
            :label="t('groups.saveButton')"
            :loading="isSavingEdit"
            @click="saveEditing"
          />
        </QCardActions>

        <QSeparator class="mt-2" />

        <QCardSection class="flex items-center justify-between py-3">
          <p class="text-xs font-semibold uppercase tracking-wide opacity-60 translate-y-2">
            {{ t('groups.membersTitle') }} · {{ group.participants.length }}
          </p>

          <QBtn
            v-if="canManage"
            class="invite-group"
            outline
            rounded
            dense
            size="sm"
            color="primary"
            icon="person_add"
            :label="t('groups.inviteButton')"
            @click="openInvite"
          />
        </QCardSection>

        <QCardSection v-if="isInviting" class="pt-0 pb-3">
          <GroupInviteSearchPanel
            v-model:query="inviteQuery"
            :results="inviteResults"
            :is-loading="isSearchingUsers || isSendingInvite"
            @select="handleInvite"
            @close="closeInvite"
          />
        </QCardSection>

        <QSeparator />

        <QCardSection class="max-h-72 overflow-y-auto p-0">
          <QList separator>
            <GroupMemberListItem
              v-for="participant in group.participants"
              :key="participant.userId"
              :participant="participant"
              :is-you="participant.userId === authStore.user?.id"
              :actions="actionsFor(participant)"
            />
          </QList>
        </QCardSection>

        <QSeparator />

        <QCardActions align="right" class="gap-2 px-4 py-3">
          <QBtn
            v-if="!isOwner"
            flat
            rounded
            color="negative"
            icon="logout"
            :label="t('groups.leaveButton')"
            @click="confirmLeaveGroup"
          />
          <QBtn
            v-if="isOwner"
            flat
            rounded
            color="negative"
            icon="delete_forever"
            :label="t('groups.deleteButton')"
            @click="confirmDeleteGroup"
          />
        </QCardActions>
      </template>
    </QCard>
  </QDialog>
</template>

<style scoped>
.invite-group {
  padding: 8px 20px;
}

.invite-group:hover {
  background-color: var(--q-primary);
  color: white;
}
</style>
