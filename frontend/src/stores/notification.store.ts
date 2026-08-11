import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import * as notificationService from '@/services/http/notification.service'
import type { Notification } from '@/types/models/notification.model'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)

  const unreadCount = computed(() => notifications.value.filter((item) => !item.isRead).length)

  async function fetchNotifications(): Promise<void> {
    isLoading.value = true

    try {
      notifications.value = await notificationService.getNotifications()
    } finally {
      isLoading.value = false
    }
  }

  async function markAsRead(notificationId: string): Promise<void> {
    const notification = notifications.value.find((item) => item.id === notificationId)

    if (!notification || notification.isRead) {
      return
    }

    notification.isRead = true

    try {
      await notificationService.markNotificationAsRead(notificationId)
    } catch (error) {
      notification.isRead = false
      throw error
    }
  }

  async function markAllAsRead(): Promise<void> {
    const previouslyUnread = notifications.value.filter((item) => !item.isRead)

    if (previouslyUnread.length === 0) {
      return
    }

    for (const item of previouslyUnread) {
      item.isRead = true
    }

    try {
      await notificationService.markAllNotificationsAsRead()
    } catch (error) {
      for (const item of previouslyUnread) {
        item.isRead = false
      }
      throw error
    }
  }

  function handleIncomingNotification(notification: Notification): void {
    notifications.value.unshift(notification)
  }

  return {
    notifications,
    isLoading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    handleIncomingNotification,
  }
})
