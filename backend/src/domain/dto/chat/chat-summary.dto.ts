export interface ChatSummaryDto {
  id: string;
  type: 'PRIVATE' | 'GROUP';
  name: string;
  imageUrl: string | null;
}
