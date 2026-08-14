import { httpClient } from './http-client'
import type { Notification } from '@/types/models/notification.model'

export async function getNotifications(): Promise<Notification[]> {
  const response = await httpClient.get<Notification[]>('/notifications')
  return response.data
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await httpClient.patch(`/notifications/${notificationId}/read`)
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await httpClient.patch('/notifications/read-all')
}
