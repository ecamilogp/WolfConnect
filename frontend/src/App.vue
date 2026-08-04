<script setup lang="ts">
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import LanguageToggle from '@/components/ui/LanguageToggle.vue'
</script>

<template>
  <router-view />
  <div class="fixed top-4 right-6 z-50 flex items-center gap-2">
    <LanguageToggle />
    <ThemeToggle />
  </div>
</template>
