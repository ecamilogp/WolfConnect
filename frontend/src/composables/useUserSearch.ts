import { ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'

import { searchUsers } from '@/services/http/user.service'
import type { UserSearchResult } from '@/types/models/user-search-result.model'

export function useUserSearch(debounceMs = 350) {
  const query = ref('')
  const debouncedQuery = refDebounced(query, debounceMs)
  const results = ref<UserSearchResult[]>([])
  const isSearching = ref(false)

  watch(debouncedQuery, async (value) => {
    const trimmed = value.trim()

    if (trimmed.length === 0) {
      results.value = []
      return
    }

    isSearching.value = true

    try {
      results.value = await searchUsers(trimmed)
    } finally {
      isSearching.value = false
    }
  })

  function reset(): void {
    query.value = ''
    results.value = []
  }

  return { query, results, isSearching, reset }
}
