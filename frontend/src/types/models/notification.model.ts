export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  body: string
  isRead: boolean
  data: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}
