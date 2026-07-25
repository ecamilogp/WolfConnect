export interface ChatResponse {
  id: string;
  type: 'PRIVATE' | 'GROUP';
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
