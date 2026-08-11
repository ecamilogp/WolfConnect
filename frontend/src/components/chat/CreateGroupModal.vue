<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { QBtn, QCard, QCardActions, QCardSection, QDialog, QIcon, QInput, QSeparator } from 'quasar'
import { useI18n } from 'vue-i18n'

import { createGroup } from '@/services/http/group.service'
import { useAppNotify } from '@/composables/useAppNotify'
import type { Chat, GroupJoinPolicy } from '@/types/models/chat.model'

const isOpen = defineModel<boolean>({ default: false })

const emit = defineEmits<{ created: [chat: Chat] }>()

const { t } = useI18n()
const { notifySuccess, notifyError } = useAppNotify()

const name = ref('')
const description = ref('')
const joinPolicy = ref<GroupJoinPolicy>('INVITATION_REQUIRED')
const isSubmitting = ref(false)
const nameError = ref('')

const joinPolicyOptions = computed(() => [
  {
    value: 'INVITATION_REQUIRED' as GroupJoinPolicy,
    icon: 'mail',
    label: t('groups.joinPolicyInvitationRequiredLabel'),
    description: t('groups.joinPolicyInvitationRequired'),
  },
  {
    value: 'AUTO_ADD' as GroupJoinPolicy,
    icon: 'bolt',
    label: t('groups.joinPolicyAutoAddLabel'),
    description: t('groups.joinPolicyAutoAdd'),
  },
])

const activePolicyDescription = computed(
  () =>
    joinPolicyOptions.value.find((option) => option.value === joinPolicy.value)?.description ?? '',
)

watch(isOpen, (open) => {
  if (!open) {
    name.value = ''
    description.value = ''
    joinPolicy.value = 'INVITATION_REQUIRED'
    nameError.value = ''
  }
})

async function handleSubmit(): Promise<void> {
  const trimmedName = name.value.trim()

  if (trimmedName.length < 3) {
    nameError.value = t('groups.nameTooShort')
    return
  }

  nameError.value = ''
  isSubmitting.value = true

  try {
    const chat = await createGroup({
      name: trimmedName,
      description: description.value.trim() || undefined,
      joinPolicy: joinPolicy.value,
    })

    notifySuccess('groups.createdNotify')
    emit('created', chat)
    isOpen.value = false
  } catch (error) {
    notifyError(error, 'groups.createError')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <QDialog v-model="isOpen">
    <QCard class="w-full max-w-md rounded-2xl">
      <QCardSection class="flex items-start gap-3 pb-3 pt-4">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-violet/10 text-brand-violet dark:bg-brand-amber/15 dark:text-brand-amber"
        >
          <QIcon name="groups" size="24px" />
        </div>

        <div class="min-w-0 flex-1 pt-0.5">
          <p class="text-lg font-semibold leading-tight">{{ t('groups.createTitle') }}</p>
          <p class="text-sm opacity-60 -translate-y-3.5">{{ t('groups.createSubtitle') }}</p>
        </div>

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

      <QCardSection class="flex flex-col gap-4 pt-4">
        <QInput
          v-model="name"
          :label="t('groups.nameLabel')"
          dense
          outlined
          rounded
          maxlength="100"
          autofocus
          :error="!!nameError"
          :error-message="nameError"
          @update:model-value="nameError = ''"
        >
          <template #prepend>
            <QIcon name="badge" size="18px" />
          </template>
        </QInput>

        <QInput
          v-model="description"
          :label="t('groups.descriptionLabel')"
          type="textarea"
          dense
          outlined
          rounded
          maxlength="255"
          autogrow
          rows="2"
        >
          <template #prepend>
            <QIcon name="notes" size="18px" />
          </template>
        </QInput>

        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide opacity-60">
            {{ t('groups.joinPolicyLabel') }}
          </p>

          <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              v-for="option in joinPolicyOptions"
              :key="option.value"
              type="button"
              role="radio"
              class="policy-card"
              :class="{ 'policy-card--active': joinPolicy === option.value }"
              :aria-checked="joinPolicy === option.value"
              @click="joinPolicy = option.value"
            >
              <QIcon :name="option.icon" size="20px" />
              <span class="text-sm font-medium">{{ option.label }}</span>
            </button>
          </div>

          <p class="translate-1 -2 text-xs opacity-60">{{ activePolicyDescription }}</p>
        </div>
      </QCardSection>

      <QCardActions align="right" class="gap-2 px-4 pb-4">
        <QBtn v-close-popup flat rounded :label="t('groups.cancel')" />
        <QBtn
          unelevated
          rounded
          color="primary"
          :label="t('groups.createSubmit')"
          :loading="isSubmitting"
          @click="handleSubmit"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<style scoped>
.policy-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 0.625rem 0.75rem;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.body--dark .policy-card {
  border-color: rgba(255, 255, 255, 0.15);
}

.policy-card:hover {
  border-color: var(--q-primary);
}

.policy-card--active {
  border-color: var(--q-primary);
  background-color: color-mix(in srgb, var(--q-primary) 12%, transparent);
}
</style>
