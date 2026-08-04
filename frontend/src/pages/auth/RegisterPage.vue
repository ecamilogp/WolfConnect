<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useAuthStore } from '@/stores/auth.store'
import { createRegisterSchema } from '@/utils/validators/auth.validators'
import { ApiError } from '@/types/api/error.type'
import logoWolf from '@/assets/images/lobo.png'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const form = reactive({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  invitationToken: '',
})

const errors = reactive<Record<string, string>>({})
const submitError = ref('')
const isSubmitting = ref(false)

async function onSubmit(): Promise<void> {
  Object.keys(errors).forEach((key) => delete errors[key])
  submitError.value = ''

  const payload = {
    ...form,
    invitationToken: form.invitationToken.trim() ? form.invitationToken.trim() : undefined,
  }

  const result = createRegisterSchema(t).safeParse(payload)

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
    await authStore.register(result.data)
    router.push({ name: 'home' })
  } catch (error) {
    submitError.value = error instanceof ApiError ? error.message : t('auth.register.genericError')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen w-full">
    <div class="flex w-1/2 items-center justify-end px-6 py-8 lg:px-10">
      <div class="flex w-full max-w-md flex-col gap-4">
        <div class="text-left">
          <h3 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {{ t('auth.register.title') }}
          </h3>
        </div>

        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <AppInput
            v-model="form.firstName"
            :label="t('auth.register.firstNameLabel')"
            :error="errors.firstName"
          />
          <AppInput
            v-model="form.lastName"
            :label="t('auth.register.lastNameLabel')"
            :error="errors.lastName"
          />
          <AppInput
            v-model="form.username"
            :label="t('auth.register.usernameLabel')"
            :error="errors.username"
          />
          <AppInput
            v-model="form.email"
            :label="t('auth.register.emailLabel')"
            type="email"
            autocomplete="email"
            :error="errors.email"
          />
          <AppInput
            v-model="form.password"
            :label="t('auth.register.passwordLabel')"
            type="password"
            autocomplete="new-password"
            :error="errors.password"
          />
          <AppInput
            v-model="form.invitationToken"
            :label="t('auth.register.invitationTokenLabel')"
            :error="errors.invitationToken"
          />

          <p v-if="submitError" class="text-sm text-negative">{{ submitError }}</p>

          <AppButton :label="t('auth.register.submit')" type="submit" :loading="isSubmitting" />
        </form>

        <RouterLink to="/login" class="text-left text-sm text-brand-violet">
          {{ t('auth.register.haveAccount') }}
        </RouterLink>
      </div>
    </div>

    <div class="flex w-1/2 items-center justify-center px-6 py-8 lg:px-10">
      <img :src="logoWolf" class="w-full max-w-[500px] object-contain" alt="Wolf mascot" />
    </div>
  </div>
</template>
