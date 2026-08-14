<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { QBtn } from 'quasar'

import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppAvatarUpload from '@/components/ui/AppAvatarUpload.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useAppNotify } from '@/composables/useAppNotify'
import { getInitialsFromName } from '@/utils/initials'
import {
  createChangePasswordSchema,
  createUpdateProfileSchema,
} from '@/utils/validators/profile.validators'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const { notifySuccess, notifyError } = useAppNotify()

const initials = computed(() => {
  const user = authStore.user

  return user ? getInitialsFromName(user.firstName, user.lastName) : ''
})

const profileForm = reactive({
  firstName: authStore.user?.firstName ?? '',
  lastName: authStore.user?.lastName ?? '',
  username: authStore.user?.username ?? '',
})

const profileErrors = reactive<Record<string, string>>({})
const isSavingProfile = ref(false)
const isUploadingAvatar = ref(false)

const isProfileDirty = computed(() => {
  const user = authStore.user

  if (!user) {
    return false
  }

  return (
    profileForm.firstName.trim() !== user.firstName ||
    profileForm.lastName.trim() !== user.lastName ||
    profileForm.username.trim() !== user.username
  )
})

async function saveProfile(): Promise<void> {
  Object.keys(profileErrors).forEach((key) => delete profileErrors[key])

  const result = createUpdateProfileSchema(t).safeParse(profileForm)

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = String(issue.path[0])
      if (!profileErrors[field]) {
        profileErrors[field] = issue.message
      }
    }
    return
  }

  isSavingProfile.value = true

  try {
    await authStore.updateProfile(result.data)
    notifySuccess('profile.updateSuccessNotify')
  } catch (error) {
    notifyError(error, 'profile.updateError')
  } finally {
    isSavingProfile.value = false
  }
}

async function handleAvatarSelect(file: File): Promise<void> {
  isUploadingAvatar.value = true

  try {
    await authStore.updateAvatar(file)
    notifySuccess('profile.avatarUpdateSuccessNotify')
  } catch (error) {
    notifyError(error, 'profile.avatarUpdateError')
  } finally {
    isUploadingAvatar.value = false
  }
}

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordErrors = reactive<Record<string, string>>({})
const isSavingPassword = ref(false)

async function savePassword(): Promise<void> {
  Object.keys(passwordErrors).forEach((key) => delete passwordErrors[key])

  const result = createChangePasswordSchema(t).safeParse(passwordForm)

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = String(issue.path[0])
      if (!passwordErrors[field]) {
        passwordErrors[field] = issue.message
      }
    }
    return
  }

  isSavingPassword.value = true

  try {
    await authStore.changePassword(result.data)
    notifySuccess('profile.passwordUpdateSuccessNotify')
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    notifyError(error, 'profile.passwordUpdateError')
  } finally {
    isSavingPassword.value = false
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
      <QBtn
        round
        flat
        dense
        icon="arrow_back"
        :aria-label="t('profile.backButton')"
        @click="goBack"
      />
      <p class="flex-1 font-semibold translate-y-2">{{ t('profile.title') }}</p>
    </header>

    <div class="flex-1 overflow-y-auto px-4 py-8">
      <div class="mx-auto flex w-full max-w-lg flex-col gap-8">
        <div class="flex flex-col items-center gap-3">
          <AppAvatarUpload
            :src="authStore.user?.profileImage ?? undefined"
            :initials="initials"
            size="96px"
            :loading="isUploadingAvatar"
            :label="t('profile.changeAvatarLabel')"
            @select="handleAvatarSelect"
          />

          <div class="text-center">
            <p class="text-lg font-semibold leading-tight">
              {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
            </p>
            <p class="text-sm opacity-60">@{{ authStore.user?.username }}</p>
            <p class="text-sm opacity-60">{{ authStore.user?.email }}</p>
          </div>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="saveProfile">
          <h4 class="text-sm font-semibold uppercase tracking-wide">
            {{ t('profile.personalInfoTitle') }}
          </h4>

          <AppInput
            v-model="profileForm.firstName"
            :label="t('profile.firstNameLabel')"
            :error="profileErrors.firstName"
          />
          <AppInput
            v-model="profileForm.lastName"
            :label="t('profile.lastNameLabel')"
            :error="profileErrors.lastName"
          />
          <AppInput
            v-model="profileForm.username"
            :label="t('profile.usernameLabel')"
            :error="profileErrors.username"
          />

          <AppButton
            class="self-end"
            type="submit"
            :label="t('profile.saveButton')"
            :loading="isSavingProfile"
            :disabled="!isProfileDirty"
          />
        </form>

        <form class="flex flex-col gap-4 mt-5" @submit.prevent="savePassword">
          <h4 class="text-sm font-semibold uppercase tracking-wide">
            {{ t('profile.passwordTitle') }}
          </h4>

          <AppInput
            v-model="passwordForm.currentPassword"
            type="password"
            autocomplete="current-password"
            :label="t('profile.currentPasswordLabel')"
            :error="passwordErrors.currentPassword"
          />
          <AppInput
            v-model="passwordForm.newPassword"
            type="password"
            autocomplete="new-password"
            :label="t('profile.newPasswordLabel')"
            :error="passwordErrors.newPassword"
          />
          <AppInput
            v-model="passwordForm.confirmPassword"
            type="password"
            autocomplete="new-password"
            :label="t('profile.confirmPasswordLabel')"
            :error="passwordErrors.confirmPassword"
          />

          <AppButton
            class="self-end"
            type="submit"
            :label="t('profile.changePasswordButton')"
            :loading="isSavingPassword"
          />
        </form>
      </div>
    </div>
  </div>
</template>
