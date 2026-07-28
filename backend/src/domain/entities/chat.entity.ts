export type ChatType = 'PRIVATE' | 'GROUP';

export type GroupJoinPolicy = 'AUTO_ADD' | 'INVITATION_REQUIRED';

export class Chat {
  constructor(
    public readonly id: string,
    public readonly type: ChatType,
    public readonly name: string | null,
    public readonly description: string | null,
    public readonly imageUrl: string | null,
    public readonly joinPolicy: GroupJoinPolicy | null,
    public readonly lastMessageAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}
}
