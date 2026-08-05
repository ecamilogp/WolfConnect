import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getCurrentUser, login as loginRequest, register as registerRequest } from '@/services/http/auth.service'
import type { LoginPayload, RegisterPayload } from '@/services/http/auth.service'
import { setAccessToken } from '@/services/http/http-client'
import { connectSocket, disconnectSocket } from '@/services/realtime/socket-client'
import type { User } from '@/types/models/user.model'

const STORAGE_KEY = 'wolfconnect.accessToken'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const isReady = ref(false)

  const isAuthenticated = computed(() => Boolean(user.value && accessToken.value))

  function applySession(token: string, sessionUser: User): void {
    accessToken.value = token
    user.value = sessionUser
    setAccessToken(token)
    localStorage.setItem(STORAGE_KEY, token)
    connectSocket()
  }

  function clearSession(): void {
    accessToken.value = null
    user.value = null
    setAccessToken(null)
    localStorage.removeItem(STORAGE_KEY)
    disconnectSocket()
  }

  async function login(payload: LoginPayload): Promise<void> {
    const result = await loginRequest(payload)
    applySession(result.accessToken, result.user)
  }

  async function register(payload: RegisterPayload): Promise<void> {
    const result = await registerRequest(payload)
    applySession(result.accessToken, result.user)
  }

  function logout(): void {
    clearSession()
  }

  async function restoreSession(): Promise<void> {
    const token = localStorage.getItem(STORAGE_KEY)

    if (!token) {
      isReady.value = true
      return
    }

    setAccessToken(token)

    try {
      const currentUser = await getCurrentUser()
      accessToken.value = token
      user.value = currentUser
      connectSocket()
    } catch {
      clearSession()
    } finally {
      isReady.value = true
    }
  }

  return {
    user,
    accessToken,
    isReady,
    isAuthenticated,
    login,
    register,
    logout,
    restoreSession,
  }
})
