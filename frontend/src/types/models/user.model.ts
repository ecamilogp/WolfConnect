export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'

export type UserRole = 'USER' | 'ADMIN'

export interface User {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  profileImage: string | null
  status: UserStatus
  role: UserRole
}
