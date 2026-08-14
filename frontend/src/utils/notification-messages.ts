import type { ComposerTranslation } from 'vue-i18n'

import type { Notification } from '@/types/models/notification.model'

function readString(data: Record<string, unknown> | null, key: string, fallback: string): string {
  const value = data?.[key]
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

export function resolveNotificationText(notification: Notification, t: ComposerTranslation): string {
  const data = notification.data
  const groupName = readString(data, 'groupName', t('notifications.fallbackGroupName'))
  const fallbackName = t('notifications.fallbackName')

  switch (notification.type) {
    case 'ADDED_TO_GROUP':
      return t('notifications.types.addedToGroup', { group: groupName })

    case 'GROUP_MEMBER_JOINED':
      return t('notifications.types.groupMemberJoined', {
        name: readString(data, 'memberName', fallbackName),
        group: groupName,
      })

    case 'GROUP_INVITATION':
      return t('notifications.types.groupInvitation', {
        name: readString(data, 'inviterName', fallbackName),
        group: groupName,
      })

    case 'GROUP_INVITATION_ACCEPTED':
      return t('notifications.types.groupInvitationAccepted', {
        name: readString(data, 'actorName', fallbackName),
        group: groupName,
      })

    case 'GROUP_INVITATION_REJECTED':
      return t('notifications.types.groupInvitationRejected', {
        name: readString(data, 'actorName', fallbackName),
        group: groupName,
      })

    default:
      return t('notifications.types.generic')
  }
}

export function resolveNotificationIcon(type: string): string {
  switch (type) {
    case 'ADDED_TO_GROUP':
      return 'group_add'
    case 'GROUP_MEMBER_JOINED':
      return 'person_add'
    case 'GROUP_INVITATION':
      return 'mail'
    case 'GROUP_INVITATION_ACCEPTED':
      return 'check_circle'
    case 'GROUP_INVITATION_REJECTED':
      return 'cancel'
    default:
      return 'notifications'
  }
}
