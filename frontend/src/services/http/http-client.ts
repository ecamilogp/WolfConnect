import axios, { type AxiosError } from 'axios'

import { env } from '@/config/env'
import { ApiError } from '@/types/api/error.type'
import type { ApiErrorEnvelope, ApiSuccessEnvelope } from '@/types/api/response.type'

let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

function omitKeys<T extends Record<string, unknown>>(source: T, keys: (keyof T)[]): Partial<T> {
  const result: Partial<T> = { ...source }
  for (const key of keys) {
    delete result[key]
  }
  return result
}

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
})

httpClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => {
    const body: unknown = response.data

    if (body && typeof body === 'object' && 'success' in body) {
      const envelope = body as ApiSuccessEnvelope
      response.data = 'data' in envelope ? envelope.data : omitKeys(envelope, ['success'])
    }

    return response
  },
  (error: AxiosError<ApiErrorEnvelope>) => {
    if (error.response) {
      const { status, data } = error.response
      return Promise.reject(new ApiError(data?.message ?? 'Unexpected error.', status, data?.errors))
    }

    return Promise.reject(new ApiError('Network error. Please check your connection.', 0))
  },
)
