import { httpClient } from './http-client'
import type { UserSearchResult } from '@/types/models/user-search-result.model'
import type { User } from '@/types/models/user.model'

export interface UpdateProfilePayload {
  firstName: string
  lastName: string
  username: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const response = await httpClient.get<UserSearchResult[]>('/users/search', {
    params: { q: query },
  })
  return response.data
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const response = await httpClient.patch<User>('/users/me', payload)
  return response.data
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await httpClient.patch('/users/me/password', payload)
}

export async function uploadAvatar(file: File): Promise<User> {
  // Axios sets the multipart/form-data Content-Type (with the correct
  // boundary) automatically when the request body is a FormData instance.
  // Setting the header manually here would strip that boundary and break
  // multer's parsing on the backend.
  const formData = new FormData()
  formData.append('avatar', file)

  const response = await httpClient.patch<User>('/users/me/avatar', formData)
  return response.data
}
