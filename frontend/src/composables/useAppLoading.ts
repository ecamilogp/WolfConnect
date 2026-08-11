import { useQuasar } from 'quasar'

export function useAppLoading() {
  const $q = useQuasar()

  function showLoading(message?: string): void {
    $q.loading.show({
      message,
      spinnerColor: 'primary',
      backgroundColor: $q.dark.isActive ? 'dark' : 'white',
      messageColor: $q.dark.isActive ? 'white' : 'dark',
    })
  }

  function hideLoading(): void {
    $q.loading.hide()
  }

  return { showLoading, hideLoading }
}
