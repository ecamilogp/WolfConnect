import { NotificationTypeValue } from '../../../shared/constants/notification-types.constant.js';

export interface CreateNotificationDto {
  userId: string;
  type: NotificationTypeValue;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
}
