import type { NavigationGuardWithThis } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'

export const authGuard: NavigationGuardWithThis<undefined> = (to) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth === true
  const isGuestOnly = to.meta.guestOnly === true
  const requiresAdmin = to.meta.requiresAdmin === true

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (isGuestOnly && authStore.isAuthenticated) {
    return { name: 'chat-empty' }
  }

  if (requiresAdmin && authStore.user?.role !== 'ADMIN') {
    return { name: 'chat-empty' }
  }

  return true
}
