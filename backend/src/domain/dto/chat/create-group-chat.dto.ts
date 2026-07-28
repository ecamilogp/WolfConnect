export interface CreateGroupChatDto {
  creatorUserId: string;

  name: string;

  description?: string;

  imageUrl?: string;

  joinPolicy: 'AUTO_ADD' | 'INVITATION_REQUIRED';
}
