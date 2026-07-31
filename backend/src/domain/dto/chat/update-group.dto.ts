export interface UpdateGroupDto {
  chatId: string;
  requesterUserId: string;
  name?: string;
  description?: string;
  imageUrl?: string;
}
