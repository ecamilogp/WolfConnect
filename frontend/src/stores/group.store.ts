import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as groupService from '@/services/http/group.service'
import type { Chat } from '@/types/models/chat.model'
import type { GroupDetail, PendingInvitation } from '@/types/models/group.model'
import type {
  GroupOwnershipTransferredPayload,
  GroupParticipantAddedPayload,
  GroupParticipantRemovedPayload,
  GroupRoleChangedPayload,
} from '@/types/socket/payloads.type'

export const useGroupStore = defineStore('group', () => {
  const pendingInvitations = ref<PendingInvitation[]>([])
  const isPendingInvitationsLoading = ref(false)

  const groupDetail = ref<GroupDetail | null>(null)
  const isGroupDetailLoading = ref(false)

  async function fetchPendingInvitations(): Promise<void> {
    isPendingInvitationsLoading.value = true

    try {
      pendingInvitations.value = await groupService.getPendingInvitations()
    } finally {
      isPendingInvitationsLoading.value = false
    }
  }

  async function acceptInvitation(invitationId: string): Promise<void> {
    await groupService.acceptInvitation(invitationId)
    pendingInvitations.value = pendingInvitations.value.filter((item) => item.id !== invitationId)
  }

  async function rejectInvitation(invitationId: string): Promise<void> {
    await groupService.rejectInvitation(invitationId)
    pendingInvitations.value = pendingInvitations.value.filter((item) => item.id !== invitationId)
  }

  async function openGroupDetail(chatId: string): Promise<void> {
    isGroupDetailLoading.value = true

    try {
      groupDetail.value = await groupService.getGroupDetail(chatId)
    } finally {
      isGroupDetailLoading.value = false
    }
  }

  function closeGroupDetail(): void {
    groupDetail.value = null
  }

  async function refreshGroupDetail(): Promise<void> {
    if (groupDetail.value) {
      await openGroupDetail(groupDetail.value.id)
    }
  }

  async function updateGroup(chatId: string, payload: groupService.UpdateGroupPayload): Promise<void> {
    const chat: Chat = await groupService.updateGroup(chatId, payload)

    if (groupDetail.value && groupDetail.value.id === chatId) {
      groupDetail.value = {
        ...groupDetail.value,
        name: chat.name,
        description: chat.description,
        imageUrl: chat.imageUrl,
      }
    }
  }

  async function updateGroupPhoto(chatId: string, file: File): Promise<void> {
    const chat: Chat = await groupService.uploadGroupPhoto(chatId, file)

    if (groupDetail.value && groupDetail.value.id === chatId) {
      groupDetail.value = {
        ...groupDetail.value,
        imageUrl: chat.imageUrl,
      }
    }
  }

  async function inviteToGroup(chatId: string, invitedUserId: string): Promise<void> {
    await groupService.inviteToGroup(chatId, invitedUserId)
  }

  async function promoteToAdmin(chatId: string, userId: string): Promise<void> {
    await groupService.promoteToAdmin(chatId, userId)
    await refreshGroupDetail()
  }

  async function demoteAdmin(chatId: string, userId: string): Promise<void> {
    await groupService.demoteAdmin(chatId, userId)
    await refreshGroupDetail()
  }

  async function removeParticipant(chatId: string, userId: string): Promise<void> {
    await groupService.removeParticipant(chatId, userId)
    await refreshGroupDetail()
  }

  async function transferOwnership(chatId: string, userId: string): Promise<void> {
    await groupService.transferOwnership(chatId, userId)
    await refreshGroupDetail()
  }

  async function leaveGroup(chatId: string): Promise<void> {
    await groupService.leaveGroup(chatId)
  }

  async function deleteGroup(chatId: string): Promise<void> {
    await groupService.deleteGroup(chatId)
  }

  function applyGroupUpdated(chat: Chat): void {
    if (groupDetail.value && groupDetail.value.id === chat.id) {
      groupDetail.value = {
        ...groupDetail.value,
        name: chat.name,
        description: chat.description,
        imageUrl: chat.imageUrl,
        joinPolicy: chat.joinPolicy,
      }
    }
  }

  function applyRoleChanged(payload: GroupRoleChangedPayload): void {
    if (!groupDetail.value || groupDetail.value.id !== payload.chatId) {
      return
    }

    const participant = groupDetail.value.participants.find((item) => item.userId === payload.userId)

    if (participant) {
      participant.role = payload.role
    }
  }

  function applyParticipantAdded(payload: GroupParticipantAddedPayload): void {
    if (!groupDetail.value || groupDetail.value.id !== payload.chatId) {
      return
    }

    const alreadyPresent = groupDetail.value.participants.some(
      (item) => item.userId === payload.participant.userId,
    )

    if (!alreadyPresent) {
      groupDetail.value.participants.push(payload.participant)
    }
  }

  function applyParticipantRemoved(payload: GroupParticipantRemovedPayload): void {
    if (!groupDetail.value || groupDetail.value.id !== payload.chatId) {
      return
    }

    groupDetail.value.participants = groupDetail.value.participants.filter(
      (item) => item.userId !== payload.userId,
    )
  }

  function applyOwnershipTransferred(payload: GroupOwnershipTransferredPayload): void {
    if (!groupDetail.value || groupDetail.value.id !== payload.chatId) {
      return
    }

    for (const participant of groupDetail.value.participants) {
      if (participant.userId === payload.previousOwnerId) {
        participant.role = 'ADMIN'
      }

      if (participant.userId === payload.newOwnerId) {
        participant.role = 'OWNER'
      }
    }
  }

  return {
    pendingInvitations,
    isPendingInvitationsLoading,
    groupDetail,
    isGroupDetailLoading,
    fetchPendingInvitations,
    acceptInvitation,
    rejectInvitation,
    openGroupDetail,
    closeGroupDetail,
    refreshGroupDetail,
    updateGroup,
    updateGroupPhoto,
    inviteToGroup,
    promoteToAdmin,
    demoteAdmin,
    removeParticipant,
    transferOwnership,
    leaveGroup,
    deleteGroup,
    applyGroupUpdated,
    applyRoleChanged,
    applyParticipantAdded,
    applyParticipantRemoved,
    applyOwnershipTransferred,
  }
})
