export type ChatType = 'PRIVATE' | 'GROUP';

export type GroupJoinPolicy = 'AUTO_ADD' | 'INVITATION_REQUIRED';

export interface ChatProps {
  id: string;
  type: ChatType;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  joinPolicy: GroupJoinPolicy | null;
  lastMessageAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class Chat {
  public readonly id: string;
  public readonly type: ChatType;
  public readonly name: string | null;
  public readonly description: string | null;
  public readonly imageUrl: string | null;
  public readonly joinPolicy: GroupJoinPolicy | null;
  public readonly lastMessageAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt: Date | null;

  constructor(props: ChatProps) {
    this.id = props.id;
    this.type = props.type;
    this.name = props.name;
    this.description = props.description;
    this.imageUrl = props.imageUrl;
    this.joinPolicy = props.joinPolicy;
    this.lastMessageAt = props.lastMessageAt;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }
}
