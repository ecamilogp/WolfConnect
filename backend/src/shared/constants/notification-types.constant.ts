export const NotificationType = {
  GROUP_INVITATION: 'GROUP_INVITATION',
  GROUP_INVITATION_ACCEPTED: 'GROUP_INVITATION_ACCEPTED',
  GROUP_INVITATION_REJECTED: 'GROUP_INVITATION_REJECTED',
  GROUP_MEMBER_JOINED: 'GROUP_MEMBER_JOINED',
  ADDED_TO_GROUP: 'ADDED_TO_GROUP',
} as const;

export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];
