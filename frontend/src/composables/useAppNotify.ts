import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import type { QNotifyCreateOptions } from 'quasar'

import { translateApiError } from '@/utils/api-error-messages'

export function useAppNotify() {
  const $q = useQuasar()
  const { t } = useI18n()

  function buildOptions(
    type: QNotifyCreateOptions['type'],
    icon: string,
    timeout: number,
    message: string,
  ): QNotifyCreateOptions {
    return {
      type,
      message,
      position: 'top-right',
      timeout,
      icon,
      classes: 'rounded-borders',
    }
  }

  function notifySuccess(key: string, params?: Record<string, unknown>): void {
    $q.notify(buildOptions('positive', 'check_circle', 2500, t(key, params ?? {})))
  }

  function notifyError(error: unknown, fallbackKey = 'groupErrors.generic'): void {
    $q.notify(buildOptions('negative', 'error_outline', 3500, translateApiError(error, t, fallbackKey)))
  }

  return { notifySuccess, notifyError }
}
