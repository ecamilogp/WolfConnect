<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppImagePreviewDialog from '@/components/ui/AppImagePreviewDialog.vue'
import { usePresenceStore } from '@/stores/presence.store'
import { useChatSocket } from '@/composables/useChatSocket'

const $q = useQuasar()
const route = useRoute()

const isMobile = computed(() => $q.screen.lt.md)
const hasActiveChat = computed(() => typeof route.params.chatId === 'string')

// On mobile there's only room for one pane at a time, so we switch between
// the conversation list and the active chat instead of showing both side by
// side (same pattern as WhatsApp Web / Telegram Web on narrow screens).
const showSidebar = computed(() => !isMobile.value || !hasActiveChat.value)
const showMain = computed(() => !isMobile.value || hasActiveChat.value)

// Presence is subscribed here (rather than in AppSidebar) because this
// layout stays mounted for the entire authenticated session — AppSidebar
// gets unmounted on mobile whenever a chat is open, which was silently
// killing the online/offline listeners and made presence look "stuck"
// until a full page reload reconnected them.
const presenceStore = usePresenceStore()
const chatSocket = useChatSocket()

const unsubscribePresence = chatSocket.subscribe({
  onMessageNew: () => {},
  onMessageEdited: () => {},
  onMessageDeleted: () => {},
  onPresenceSnapshot: (payload) => presenceStore.setSnapshot(payload.onlineUserIds),
  onPresenceOnline: (payload) => presenceStore.markOnline(payload.userId),
  onPresenceOffline: (payload) => presenceStore.markOffline(payload.userId),
})

onUnmounted(() => {
  unsubscribePresence()
})
</script>

<template>
  <div class="flex h-screen w-full overflow-hidden">
    <AppSidebar v-if="showSidebar" />
    <main v-if="showMain" class="min-w-0 flex-1 overflow-y-auto">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <AppImagePreviewDialog />
  </div>
</template>

<style scoped>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.15s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
