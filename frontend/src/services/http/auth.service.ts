import { httpClient } from './http-client'
import type { User } from '@/types/models/user.model'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  invitationToken?: string
}

export interface AuthResult {
  user: User
  accessToken: string
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  const response = await httpClient.post<AuthResult>('/auth/login', payload)
  return response.data
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const response = await httpClient.post<AuthResult>('/auth/register', payload)
  return response.data
}

export async function getCurrentUser(): Promise<User> {
  const response = await httpClient.get<User>('/users/me')
  return response.data
}
