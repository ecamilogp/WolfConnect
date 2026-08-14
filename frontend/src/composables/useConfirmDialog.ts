import { useQuasar } from 'quasar'

/**
 * Wraps Quasar's confirm-dialog pattern (title + message + cancel button)
 * used by every destructive/irreversible action in the app, so each call
 * site only supplies the copy and the action to run on confirmation.
 */
export function useConfirmDialog() {
  const $q = useQuasar()

  function confirm(title: string, message: string, onConfirm: () => void): void {
    $q.dialog({
      title,
      message,
      cancel: true,
      persistent: true,
    }).onOk(onConfirm)
  }

  return { confirm }
}
