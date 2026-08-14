<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { QBtn, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppLoadingState from '@/components/ui/AppLoadingState.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AdminUserListItem from '@/components/admin/AdminUserListItem.vue'
import type { AdminUserAction } from '@/components/admin/AdminUserListItem.vue'
import {
  adminDeactivateUser,
  blockUser,
  listUsers,
  reactivateUser,
  updateUserRole,
} from '@/services/http/user.service'
import { useAuthStore } from '@/stores/auth.store'
import { useAppNotify } from '@/composables/useAppNotify'
import type { User, UserRole } from '@/types/models/user.model'

const router = useRouter()
const { t } = useI18n()
const $q = useQuasar()
const authStore = useAuthStore()
const { notifySuccess, notifyError } = useAppNotify()

const users = ref<User[]>([])
const isLoading = ref(false)
const updatingUserId = ref<string | null>(null)
const updatingStatusUserId = ref<string | null>(null)

async function fetchUsers(): Promise<void> {
  isLoading.value = true

  try {
    users.value = await listUsers()
  } catch (error) {
    notifyError(error, 'admin.loadError')
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchUsers)

function confirmToggleRole(user: User): void {
  const nextRole: UserRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
  const messageKey = nextRole === 'ADMIN' ? 'admin.promoteConfirm' : 'admin.demoteConfirm'

  $q.dialog({
    title: nextRole === 'ADMIN' ? t('admin.promoteAction') : t('admin.demoteAction'),
    message: t(messageKey, { name: `${user.firstName} ${user.lastName}` }),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    toggleRole(user, nextRole)
  })
}

async function toggleRole(user: User, nextRole: UserRole): Promise<void> {
  updatingUserId.value = user.id

  try {
    const updatedUser = await updateUserRole(user.id, nextRole)
    const index = users.value.findIndex((item) => item.id === user.id)

    if (index !== -1) {
      users.value[index] = updatedUser
    }

    notifySuccess(nextRole === 'ADMIN' ? 'admin.promoteSuccessNotify' : 'admin.demoteSuccessNotify')
  } catch (error) {
    notifyError(error, 'admin.actionError')
  } finally {
    updatingUserId.value = null
  }
}

type UserStatusAction = 'deactivate' | 'block' | 'reactivate'

function actionsFor(user: User): AdminUserAction[] {
  if (user.id === authStore.user?.id) {
    return []
  }

  const actions: AdminUserAction[] = []

  if (user.status === 'ACTIVE') {
    actions.push({
      label: t('admin.deactivateAction'),
      icon: 'person_off',
      handler: () => confirmStatusChange(user, 'deactivate'),
    })
  } else {
    actions.push({
      label: t('admin.reactivateAction'),
      icon: 'restart_alt',
      handler: () => confirmStatusChange(user, 'reactivate'),
    })
  }

  if (user.status !== 'BLOCKED') {
    actions.push({
      label: t('admin.blockAction'),
      icon: 'block',
      color: 'negative',
      handler: () => confirmStatusChange(user, 'block'),
    })
  }

  return actions
}

function confirmStatusChange(user: User, action: UserStatusAction): void {
  const titleKey =
    action === 'deactivate'
      ? 'admin.deactivateAction'
      : action === 'block'
        ? 'admin.blockAction'
        : 'admin.reactivateAction'

  const messageKey =
    action === 'deactivate'
      ? 'admin.deactivateConfirm'
      : action === 'block'
        ? 'admin.blockConfirm'
        : 'admin.reactivateConfirm'

  $q.dialog({
    title: t(titleKey),
    message: t(messageKey, { name: `${user.firstName} ${user.lastName}` }),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    applyStatusChange(user, action)
  })
}

async function applyStatusChange(user: User, action: UserStatusAction): Promise<void> {
  updatingStatusUserId.value = user.id

  try {
    const updatedUser =
      action === 'deactivate'
        ? await adminDeactivateUser(user.id)
        : action === 'block'
          ? await blockUser(user.id)
          : await reactivateUser(user.id)

    const index = users.value.findIndex((item) => item.id === user.id)

    if (index !== -1) {
      users.value[index] = updatedUser
    }

    const successKey =
      action === 'deactivate'
        ? 'admin.deactivateSuccessNotify'
        : action === 'block'
          ? 'admin.blockSuccessNotify'
          : 'admin.reactivateSuccessNotify'

    notifySuccess(successKey)
  } catch (error) {
    notifyError(error, 'admin.actionError')
  } finally {
    updatingStatusUserId.value = null
  }
}

function goBack(): void {
  router.back()
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header
      class="flex items-center gap-3 bg-[#FAF8F8] dark:bg-[#16151B] border-b border-black/20 px-4 py-3 dark:border-white/20"
    >
      <QBtn round flat dense icon="arrow_back" :aria-label="t('admin.backButton')" @click="goBack" />
      <p class="flex-1 font-semibold translate-y-2">{{ t('admin.title') }}</p>
    </header>

    <div class="flex-1 overflow-y-auto px-4 py-6">
      <div class="mx-auto w-full max-w-2xl">
        <AppLoadingState v-if="isLoading" />

        <AppEmptyState
          v-else-if="users.length === 0"
          icon="group"
          :title="t('admin.emptyTitle')"
          :description="t('admin.emptyDescription')"
        />

        <div v-else class="flex flex-col divide-y divide-black/10 dark:divide-white/10">
          <AdminUserListItem
            v-for="user in users"
            :key="user.id"
            :user="user"
            :is-you="user.id === authStore.user?.id"
            :is-updating-role="updatingUserId === user.id"
            :is-updating-status="updatingStatusUserId === user.id"
            :actions="actionsFor(user)"
            @toggle-role="confirmToggleRole(user)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
