export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface UserProps {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  profileImage: string | null;
  status: UserStatus;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class User {
  public readonly id: string;
  public firstName: string;
  public lastName: string;
  public username: string;
  public email: string;
  public password: string;
  public profileImage: string | null;
  public status: UserStatus;
  public role: UserRole;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date | null;

  constructor(props: UserProps) {
    this.id = props.id;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.username = props.username;
    this.email = props.email;
    this.password = props.password;
    this.profileImage = props.profileImage;
    this.status = props.status;
    this.role = props.role;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }
}
