<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppInput from '@/components/forms/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useAuthStore } from '@/stores/auth.store'
import { createRegisterSchema } from '@/utils/validators/auth.validators'
import { useTheme } from '@/composables/useTheme'
import { useAppLoading } from '@/composables/useAppLoading'
import { useAppNotify } from '@/composables/useAppNotify'
import logoWolf from '@/assets/images/headwolfeyepruple.png'
import logoWolfDark from '@/assets/images/headwolf.png'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()
const { isDark } = useTheme()
const { showLoading, hideLoading } = useAppLoading()
const { notifySuccess, notifyError } = useAppNotify()

const form = reactive({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
})

const errors = reactive<Record<string, string>>({})
const isSubmitting = ref(false)

async function onSubmit(): Promise<void> {
  Object.keys(errors).forEach((key) => delete errors[key])

  const invitationTokenFromLink = route.query.invitationToken

  const payload = {
    ...form,
    invitationToken: typeof invitationTokenFromLink === 'string' ? invitationTokenFromLink : undefined,
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
  showLoading(t('auth.register.loadingMessage'))

  try {
    await authStore.register(result.data)
    notifySuccess('auth.register.successNotify')
    router.push({ name: 'chat-empty' })
  } catch (error) {
    notifyError(error, 'auth.register.genericError')
  } finally {
    isSubmitting.value = false
    hideLoading()
  }
}
</script>

<template>
  <div class="flex min-h-dvh w-full flex-col md:flex-row">
    <div
      class="flex w-full flex-1 items-center justify-center px-6 py-8 md:flex-none md:w-1/2 md:justify-end md:px-10"
    >
      <div class="flex w-full max-w-md flex-col gap-4">
        <div class="text-left">
          <h4
            class="text-3xl mb-2.5 font-black tracking-tight bg-linear-to-t from-brand-violet to-black dark:from-brand-amber dark:to-white bg-clip-text text-transparent"
          >
            {{ t('auth.register.title') }}
          </h4>
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

          <AppButton :label="t('auth.register.submit')" type="submit" :loading="isSubmitting" />
        </form>

        <RouterLink to="/login" class="text-left text-sm text-brand-violet dark:text-brand-amber">
          {{ t('auth.register.haveAccount') }}
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
