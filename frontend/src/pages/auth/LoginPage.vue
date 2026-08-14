<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useAuthStore } from '@/stores/auth.store'
import { createLoginSchema } from '@/utils/validators/auth.validators'
import { useTheme } from '@/composables/useTheme'
import { useAppNotify } from '@/composables/useAppNotify'

import logoWolf from '@/assets/images/headwolfeyepruple.png'
import logoWolfDark from '@/assets/images/headwolf.png'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const { isDark } = useTheme()
const { notifySuccess, notifyError } = useAppNotify()

const form = reactive({ email: '', password: '' })
const errors = reactive<Record<string, string>>({})
const isSubmitting = ref(false)

async function onSubmit(): Promise<void> {
  Object.keys(errors).forEach((key) => delete errors[key])

  const result = createLoginSchema(t).safeParse(form)

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = String(issue.path[0])
      if (!errors[field]) {
        errors[field] = issue.message
      }
    }
    return
  }

  isSubmitting.value = true

  try {
    await authStore.login(result.data)
    notifySuccess('auth.login.successNotify')
    router.push({ name: 'chat-empty' })
  } catch (error) {
    notifyError(error, 'auth.login.genericError')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-dvh w-full flex-col md:flex-row">
    <div
      class="flex w-full flex-1 items-center justify-end px-6 py-8 md:flex-none md:w-1/2 md:justify-end md:px-10"
    >
      <div class="flex w-full max-w-xl flex-col gap-5">
        <div class="text-left">
          <h4
            class="text-3xl text-center mb-2.5 font-black tracking-tight bg-linear-to-t from-brand-violet to-black dark:from-white dark:to-brand-amber bg-clip-text text-transparent"
          >
            {{ t('auth.login.title') }}
          </h4>
        </div>

        <form class="flex flex-col gap-5" @submit.prevent="onSubmit">
          <AppInput
            v-model="form.email"
            :label="t('auth.login.emailLabel')"
            type="email"
            autocomplete="email"
            :error="errors.email"
            class="w-full"
          />
          <AppInput
            v-model="form.password"
            :label="t('auth.login.passwordLabel')"
            type="password"
            autocomplete="current-password"
            :error="errors.password"
            class="w-full"
          />

          <AppButton
            :label="t('auth.login.submit')"
            type="submit"
            :loading="isSubmitting"
            class="w-full py-3"
          />
        </form>

        <RouterLink
          to="/register"
          class="text-left text-sm text-brand-violet dark:text-brand-amber"
        >
          {{ t('auth.login.createAccount') }}
        </RouterLink>
      </div>
    </div>

    <div class="wolf w-1/2 items-center justify-center px-6 py-8 md:px-10">
      <img
        :src="isDark ? logoWolfDark : logoWolf"
        class="w-full max-w-135 object-contain"
        alt="Wolf mascot"
      />
    </div>
  </div>
</template>

<style scoped>
.wolf {
  display: none;
  filter: drop-shadow(0 0 1.5px #693ac3);
}

.body--dark .wolf {
  filter: drop-shadow(0 0 1.5px #f2b71d);
}

@media (min-width: 768px) {
  .wolf {
    display: flex;
  }
}
</style>
