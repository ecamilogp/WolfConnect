export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
}
