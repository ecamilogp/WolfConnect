import { httpClient } from './http-client'
import type { UserSearchResult } from '@/types/models/user-search-result.model'

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const response = await httpClient.get<UserSearchResult[]>('/users/search', {
    params: { q: query },
  })
  return response.data
}
