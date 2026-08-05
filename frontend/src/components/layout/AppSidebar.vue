<script setup lang="ts">
import { computed, ref } from 'vue'
import { QAvatar, QBtn, QIcon, QInput, QItem, QItemSection, QList, QMenu } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import LanguageToggle from '@/components/ui/LanguageToggle.vue'
import { useAuthStore } from '@/stores/auth.store'
import { useTheme } from '@/composables/useTheme'
import brandMark from '@/assets/images/WolfconnectimageLight.png'
import brandMarkDark from '@/assets/images/WolfconnectimageDark.png'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const { isDark } = useTheme()

const search = ref('')

const fullName = computed(() => {
  const user = authStore.user

  if (!user) {
    return ''
  }

  return `${user.firstName} ${user.lastName}`
})

const initials = computed(() => {
  const user = authStore.user

  if (!user) {
    return ''
  }

  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
})

async function handleLogout(): Promise<void> {
  authStore.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <aside class="app-sidebar flex h-full w-80 shrink-0 flex-col">
    <div class="flex items-center gap-2 px-4 py-4">
      <img
        :src="isDark ? brandMarkDark : brandMark"
        alt="WolfConnect"
        class="h-9 w-auto object-cover"
      />
      <div class="flex ml-6 mb-1 items-end justify-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </div>

    <div class="px-3 pb-3">
      <QInput v-model="search" :placeholder="t('sidebar.searchPlaceholder')" dense outlined rounded>
        <template #prepend>
          <QIcon name="search" size="18px" />
        </template>
      </QInput>
    </div>

    <div class="flex-1 overflow-y-auto px-2">
      <AppEmptyState
        :title="t('sidebar.noConversationsTitle')"
        :description="t('sidebar.noConversationsDescription')"
      />
    </div>

    <div class="app-sidebar__footer border-t border-white/10 px-6 py-4">
      <div class="flex items-center gap-3">
        <QAvatar
          size="45px"
          text-color="white"
          class="font-semibold bg-brand-violet dark:bg-brand-amber"
        >
          {{ initials }}
        </QAvatar>

        <div class="min-w-0 flex-1 overflow-hidden">
          <p class="truncate text-sm font-semibold leading-tight translate-y-3">
            {{ fullName }}
            <span class="font-normal text-gray-500 dark:text-gray-400"> — {{ authStore.user?.username }}</span>
          </p>

          <p class="truncate text-xs leading-tight text-gray-500 dark:text-gray-400">
            {{ authStore.user?.email }}
          </p>
        </div>

        <QBtn round flat dense icon="more_vert" color="grey-6">
          <QMenu>
            <QList dense>
              <QItem v-close-popup clickable @click="handleLogout">
                <QItemSection>
                  {{ t('layout.logout') }}
                </QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </QBtn>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  background-color: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

.body--dark .app-sidebar {
  background-color: var(--q-dark);
  border-right-color: rgba(255, 255, 255, 0.08);
}

.app-sidebar__footer {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.body--dark .app-sidebar__footer {
  border-top-color: rgba(255, 255, 255, 0.08);
}
</style>
