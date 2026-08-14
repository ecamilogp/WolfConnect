import { computed } from 'vue'
import { Dark } from 'quasar'

const THEME_STORAGE_KEY = 'wolfconnect:dark-mode'

export function getStoredDarkMode(): boolean {
  return localStorage.getItem(THEME_STORAGE_KEY) === 'true'
}

function persist(value: boolean): void {
  localStorage.setItem(THEME_STORAGE_KEY, String(value))
}

export function useTheme() {
  const isDark = computed(() => Dark.isActive)

  function toggle(): void {
    Dark.toggle()
    persist(Dark.isActive)
  }

  function set(value: boolean | 'auto'): void {
    Dark.set(value)
    persist(Dark.isActive)
  }

  return { isDark, toggle, set }
}
