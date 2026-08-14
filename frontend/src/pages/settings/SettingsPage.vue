<script setup lang="ts">
import { ref } from 'vue'
import { QBtn, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppButton from '@/components/ui/AppButton.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useAppNotify } from '@/composables/useAppNotify'
import { useAppLoading } from '@/composables/useAppLoading'

const router = useRouter()
const { t } = useI18n()
const $q = useQuasar()
const authStore = useAuthStore()
const { notifyError } = useAppNotify()
const { showLoading, hideLoading } = useAppLoading()

const isDeactivating = ref(false)

function goBack(): void {
  router.back()
}

function confirmDeactivate(): void {
  $q.dialog({
    title: t('settings.deactivateAccountButton'),
    message: t('settings.deactivateConfirm'),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    deactivateAccount()
  })
}

async function deactivateAccount(): Promise<void> {
  isDeactivating.value = true
  showLoading(t('settings.deactivateLoadingMessage'))

  try {
    await authStore.deactivateAccount()
    await router.push({ name: 'login' })
  } catch (error) {
    notifyError(error, 'settings.deactivateError')
  } finally {
    isDeactivating.value = false
    hideLoading()
  }
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
        :aria-label="t('settings.backButton')"
        @click="goBack"
      />
      <p class="flex-1 font-semibold translate-y-2">{{ t('settings.title') }}</p>
    </header>

    <div class="flex-1 overflow-y-auto px-4 py-8">
      <div class="mx-auto flex w-full max-w-lg flex-col gap-8">
        <section class="flex flex-col gap-4">
          <h4 class="text-sm font-semibold uppercase tracking-wide opacity-60">
            {{ t('settings.accountTitle') }}
          </h4>

          <div
            class="flex flex-col items-start gap-4 rounded-xl border border-red-500/30 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-sm font-medium">{{ t('settings.deactivateAccountButton') }}</p>
              <p class="text-xs opacity-60">{{ t('settings.deactivateDescription') }}</p>
            </div>

            <AppButton
              color="negative"
              outline
              :label="t('settings.deactivateAccountButton')"
              :loading="isDeactivating"
              @click="confirmDeactivate"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
