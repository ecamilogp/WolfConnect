import type { ComposerTranslation } from 'vue-i18n'

import { ApiError } from '@/types/api/error.type'

const KNOWN_MESSAGES: Record<string, string> = {
  'Chat not found.': 'groupErrors.chatNotFound',
  'Group not found.': 'groupErrors.groupNotFound',
  'Cannot leave a private chat.': 'groupErrors.cannotLeavePrivateChat',
  'Cannot delete a private chat.': 'groupErrors.cannotDeletePrivateChat',
  'Cannot update a private chat.': 'groupErrors.cannotUpdatePrivateChat',
  'Chat is not a group.': 'groupErrors.chatIsNotGroup',
  'You are not a participant of this group.': 'groupErrors.notAParticipant',
  'You have already left this group.': 'groupErrors.alreadyLeft',
  'The group owner cannot leave the group. Transfer ownership or delete the group first.':
    'groupErrors.ownerCannotLeave',
  'You cannot remove yourself. Use leave group instead.': 'groupErrors.cannotRemoveSelf',
  'The group owner cannot be removed. Transfer ownership first.': 'groupErrors.cannotRemoveOwner',
  'Only the group owner can remove an admin.': 'groupErrors.onlyOwnerCanRemoveAdmin',
  'Only the group owner can delete the group.': 'groupErrors.onlyOwnerCanDelete',
  'Participant not found in this group.': 'groupErrors.participantNotFound',
  'User not found.': 'groupErrors.userNotFound',
  'You cannot invite yourself to the group.': 'groupErrors.cannotInviteSelf',
  'You do not have permission to invite users to this group.': 'groupErrors.noInvitePermission',
  'User is already a participant of this group.': 'groupErrors.userAlreadyParticipant',
  'The user already has a pending invitation to this group.': 'groupErrors.userAlreadyInvited',
  'You cannot change your own role.': 'groupErrors.cannotChangeOwnRole',
  'Only a member can be promoted to admin.': 'groupErrors.onlyMemberCanBePromoted',
  'Only an admin can be demoted to member.': 'groupErrors.onlyAdminCanBeDemoted',
  'Invitation not found.': 'groupErrors.invitationNotFound',
  'You are not allowed to reject this invitation.': 'groupErrors.notAllowedToReject',
  'You are not allowed to accept this invitation.': 'groupErrors.notAllowedToAccept',
  'Invitation has already been processed.': 'groupErrors.invitationAlreadyProcessed',
  'You are already the group owner.': 'groupErrors.alreadyOwner',

  'Invalid email or password': 'authErrors.invalidCredentials',
  'Your account has been deactivated.': 'authErrors.accountDeactivated',
  'Your account has been blocked.': 'authErrors.accountBlocked',
  'Email already exists': 'authErrors.emailExists',
  'Username already exists': 'authErrors.usernameExists',
  'This invitation link is invalid or has already been used.': 'authErrors.invitationInvalid',
  'This invitation link has expired.': 'authErrors.invitationExpired',
}

export function translateApiError(
  error: unknown,
  t: ComposerTranslation,
  fallbackKey = 'groupErrors.generic',
): string {
  if (error instanceof ApiError) {
    const key = KNOWN_MESSAGES[error.message]

    if (key) {
      return t(key)
    }
  }

  return t(fallbackKey)
}
