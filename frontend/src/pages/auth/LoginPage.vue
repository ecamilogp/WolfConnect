<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useAuthStore } from '@/stores/auth.store'
import { createLoginSchema } from '@/utils/validators/auth.validators'
import { ApiError } from '@/types/api/error.type'

import logoWolf from '@/assets/images/lobo.png'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const form = reactive({ email: '', password: '' })
const errors = reactive<Record<string, string>>({})
const submitError = ref('')
const isSubmitting = ref(false)

async function onSubmit(): Promise<void> {
  Object.keys(errors).forEach((key) => delete errors[key])
  submitError.value = ''

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
    router.push({ name: 'home' })
  } catch (error) {
    submitError.value = error instanceof ApiError ? error.message : t('auth.login.genericError')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen w-full">
    <div class="flex w-1/2 items-center justify-end px-6 py-8 lg:px-10">
      <div class="flex w-full max-w-xl flex-col gap-5">
        <div class="text-left">
          <h3 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {{ t('auth.login.title') }}
          </h3>
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

          <p v-if="submitError" class="text-sm text-negative">{{ submitError }}</p>

          <AppButton
            :label="t('auth.login.submit')"
            type="submit"
            :loading="isSubmitting"
            class="w-full py-3"
          />
        </form>

        <RouterLink to="/register" class="text-left text-sm text-brand-violet">
          {{ t('auth.login.createAccount') }}
        </RouterLink>
      </div>
    </div>

    <div class="flex w-1/2 items-center justify-center px-6 py-8 lg:px-10">
      <img :src="logoWolf" class="w-full max-w-[500px] object-contain" alt="Wolf mascot" />
    </div>
  </div>
</template>
