export interface RegisterUserDTO {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  invitationToken?: string;
}
