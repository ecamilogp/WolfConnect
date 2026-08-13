<script setup lang="ts">
import { ref, watch } from 'vue'
import { QBtn, QCard, QCardActions, QCardSection, QDialog, QIcon, QInput, QSeparator } from 'quasar'
import { useI18n } from 'vue-i18n'

import { createPlatformInvitation } from '@/services/http/platform-invitation.service'
import { useAppNotify } from '@/composables/useAppNotify'
import { ApiError } from '@/types/api/error.type'

const isOpen = defineModel<boolean>({ default: false })

const { t } = useI18n()
const { notifySuccess, notifyError } = useAppNotify()

const email = ref('')
const isSubmitting = ref(false)
const emailError = ref('')

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

watch(isOpen, (open) => {
  if (!open) {
    email.value = ''
    emailError.value = ''
  }
})

async function handleSubmit(): Promise<void> {
  const trimmedEmail = email.value.trim()

  if (!emailPattern.test(trimmedEmail)) {
    emailError.value = t('platformInvitations.invalidEmail')
    return
  }

  emailError.value = ''
  isSubmitting.value = true

  try {
    await createPlatformInvitation(trimmedEmail)
    notifySuccess('platformInvitations.sentNotify', { email: trimmedEmail })
    isOpen.value = false
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.message === 'This email is already registered on WolfConnect.'
    ) {
      emailError.value = t('platformInvitations.errors.alreadyRegistered')
    } else {
      notifyError(error, 'platformInvitations.sendError')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <QDialog v-model="isOpen">
    <QCard class="w-full max-w-sm rounded-2xl">
      <QCardSection class="flex items-start gap-3 pb-3 pt-4">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-violet/10 text-brand-violet dark:bg-brand-amber/15 dark:text-brand-amber"
        >
          <QIcon name="person_add" size="24px" />
        </div>

        <div class="min-w-0 flex-1 pt-0.5">
          <p class="text-lg font-semibold leading-tight">{{ t('platformInvitations.title') }}</p>
          <p class="text-sm opacity-60 -translate-y-3.5">{{ t('platformInvitations.subtitle') }}</p>
        </div>

        <QBtn
          v-close-popup
          round
          flat
          dense
          icon="close"
          size="sm"
          :aria-label="t('platformInvitations.close')"
        />
      </QCardSection>

      <QSeparator />

      <QCardSection class="pt-4">
        <QInput
          v-model="email"
          :label="t('platformInvitations.emailLabel')"
          type="email"
          dense
          outlined
          rounded
          autofocus
          :error="!!emailError"
          :error-message="emailError"
          @update:model-value="emailError = ''"
          @keyup.enter="handleSubmit"
        >
          <template #prepend>
            <QIcon name="alternate_email" size="18px" />
          </template>
        </QInput>
      </QCardSection>

      <QCardActions align="right" class="gap-2 px-4 pb-4">
        <QBtn v-close-popup flat rounded :label="t('platformInvitations.cancel')" />
        <QBtn
          unelevated
          rounded
          color="primary"
          :label="t('platformInvitations.submit')"
          :loading="isSubmitting"
          @click="handleSubmit"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>
