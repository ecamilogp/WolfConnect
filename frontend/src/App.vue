<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import LanguageToggle from '@/components/ui/LanguageToggle.vue'

const route = useRoute()

const showFloatingControls = computed(() => !route.meta.requiresAuth)
</script>

<template>
  <router-view />
  <div v-if="showFloatingControls" class="fixed top-4 right-6 z-50 flex items-center gap-2">
    <LanguageToggle />
    <ThemeToggle />
  </div>
</template>
