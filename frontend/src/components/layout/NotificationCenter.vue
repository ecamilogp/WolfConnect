<script setup lang="ts">
import { onUnmounted } from 'vue'
import { QBadge, QBtn, QIcon, QItem, QItemSection, QList, QMenu, QSeparator, QSpinnerDots, QTooltip } from 'quasar'
import { useI18n } from 'vue-i18n'

import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import { useNotificationStore } from '@/stores/notification.store'
import { useChatSocket } from '@/composables/useChatSocket'
import { useAppNotify } from '@/composables/useAppNotify'
import { resolveNotificationIcon, resolveNotificationText } from '@/utils/notification-messages'
import type { Notification } from '@/types/models/notification.model'

const { t } = useI18n()
const notificationStore = useNotificationStore()
const chatSocket = useChatSocket()
const { notifyError } = useAppNotify()

notificationStore.fetchNotifications().catch((error) => {
  notifyError(error)
})

const unsubscribe = chatSocket.subscribeToNotifications((notification: Notification) => {
  notificationStore.handleIncomingNotification(notification)
})

onUnmounted(() => {
  unsubscribe()
})

function handleItemClick(notification: Notification): void {
  if (notification.isRead) {
    return
  }

  notificationStore.markAsRead(notification.id).catch((error) => {
    notifyError(error)
  })
}

function handleMarkAllRead(): void {
  notificationStore.markAllAsRead().catch((error) => {
    notifyError(error)
  })
}

function relativeTime(dateStr: string): string {
  const diffMinutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)

  if (diffMinutes < 1) {
    return t('notifications.justNow')
  }

  if (diffMinutes < 60) {
    return t('notifications.minutesAgo', { count: diffMinutes })
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return t('notifications.hoursAgo', { count: diffHours })
  }

  return t('notifications.daysAgo', { count: Math.floor(diffHours / 24) })
}
</script>

<template>
  <QBtn round flat dense icon="notifications" color="grey-6">
    <QBadge v-if="notificationStore.unreadCount > 0" color="primary" floating rounded>
      {{ notificationStore.unreadCount }}
    </QBadge>
    <QTooltip anchor="bottom middle" self="top middle">
      {{ t('notifications.tooltip') }}
    </QTooltip>

    <QMenu anchor="bottom right" self="top right">
      <div class="notification-center flex w-80 flex-col">
        <div class="flex items-center justify-between px-4 py-3">
          <p class="text-sm font-semibold translate-y-2">{{ t('notifications.title') }}</p>
          <QBtn
            v-if="notificationStore.unreadCount > 0"
            flat
            dense
            no-caps
            size="sm"
            color="primary"
            :label="t('notifications.markAllRead')"
            @click="handleMarkAllRead"
          />
        </div>

        <QSeparator />

        <div class="max-h-96 overflow-y-auto">
          <div v-if="notificationStore.isLoading" class="flex justify-center py-6">
            <QSpinnerDots size="28px" color="primary" />
          </div>

          <AppEmptyState
            v-else-if="notificationStore.notifications.length === 0"
            icon="notifications_none"
            :title="t('notifications.emptyTitle')"
            :description="t('notifications.emptyDescription')"
          />

          <QList v-else separator>
            <QItem
              v-for="notification in notificationStore.notifications"
              :key="notification.id"
              clickable
              :class="{ 'notification-item--unread': !notification.isRead }"
              @click="handleItemClick(notification)"
            >
              <QItemSection avatar>
                <QIcon :name="resolveNotificationIcon(notification.type)" color="primary" size="22px" />
              </QItemSection>

              <QItemSection>
                <p class="text-sm leading-snug">{{ resolveNotificationText(notification, t) }}</p>
                <p class="text-xs opacity-60">{{ relativeTime(notification.createdAt) }}</p>
              </QItemSection>

              <QItemSection v-if="!notification.isRead" side>
                <span class="notification-dot" />
              </QItemSection>
            </QItem>
          </QList>
        </div>
      </div>
    </QMenu>
  </QBtn>
</template>

<style scoped>
.notification-item--unread {
  background-color: color-mix(in srgb, var(--q-primary) 6%, transparent);
}

.notification-dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--q-primary);
}
</style>
