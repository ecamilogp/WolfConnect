export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export class User {
  constructor(
    public readonly id: string,
    public firstName: string,
    public lastName: string,
    public username: string,
    public email: string,
    public password: string,
    public profileImage: string | null,
    public status: UserStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}
}
