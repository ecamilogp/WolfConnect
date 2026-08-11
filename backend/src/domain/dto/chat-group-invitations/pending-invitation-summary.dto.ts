export interface PendingInvitationSummaryDto {
  id: string;
  chatId: string;
  groupName: string;
  groupImageUrl: string | null;
  invitedByUserId: string;
  invitedByName: string;
  createdAt: Date;
}
