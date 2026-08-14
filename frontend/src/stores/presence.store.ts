import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePresenceStore = defineStore('presence', () => {
  // Plain reactive object keyed by userId — Vue tracks property
  // addition/deletion on refs of plain objects, so this stays reactive
  // without needing a wrapped Set/Map.
  const onlineUserIds = ref<Record<string, true>>({})

  function setSnapshot(userIds: string[]): void {
    const next: Record<string, true> = {}

    for (const userId of userIds) {
      next[userId] = true
    }

    onlineUserIds.value = next
  }

  function markOnline(userId: string): void {
    // Reassign a new object (instead of mutating the existing one in place)
    // so the change is unambiguously picked up wherever `onlineUserIds` is
    // read, even for a key that no consumer has read/tracked yet.
    onlineUserIds.value = { ...onlineUserIds.value, [userId]: true }
  }

  function markOffline(userId: string): void {
    const next = { ...onlineUserIds.value }
    delete next[userId]
    onlineUserIds.value = next
  }

  function isOnline(userId: string | null | undefined): boolean {
    return !!userId && !!onlineUserIds.value[userId]
  }

  function reset(): void {
    onlineUserIds.value = {}
  }

  return {
    onlineUserIds,
    setSnapshot,
    markOnline,
    markOffline,
    isOnline,
    reset,
  }
})
