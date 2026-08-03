import { computed } from 'vue'
import { Dark } from 'quasar'

export function useTheme() {
  const isDark = computed(() => Dark.isActive)

  function toggle(): void {
    Dark.toggle()
  }

  function set(value: boolean | 'auto'): void {
    Dark.set(value)
  }

  return { isDark, toggle, set }
}
