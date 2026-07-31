export const NotificationType = {
  GROUP_INVITATION: 'GROUP_INVITATION',
  GROUP_INVITATION_ACCEPTED: 'GROUP_INVITATION_ACCEPTED',
  GROUP_INVITATION_REJECTED: 'GROUP_INVITATION_REJECTED',
  GROUP_MEMBER_JOINED: 'GROUP_MEMBER_JOINED',
} as const;

export type NotificationTypeValue = (typeof NotificationType)[keyof typeof NotificationType];
