export const SocketEvents = {
  CONNECTION: 'connection',
  CONNECT: 'connect',
  CONNECT_ERROR: 'connect_error',
  DISCONNECT: 'disconnect',

  PRESENCE_ONLINE: 'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',

  CHAT_JOIN: 'chat:join',
  CHAT_JOINED: 'chat:joined',
  CHAT_LEAVE: 'chat:leave',
  CHAT_LEFT: 'chat:left',

  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  MESSAGE_EDIT: 'message:edit',
  MESSAGE_EDITED: 'message:edited',
  MESSAGE_DELETE: 'message:delete',
  MESSAGE_DELETED: 'message:deleted',
  MESSAGE_REACTION_UPDATED: 'message:reaction:updated',

  ATTACHMENT_UPLOADED: 'attachment:uploaded',

  GROUP_UPDATED: 'group:updated',
  GROUP_ROLE_CHANGED: 'group:role:changed',
  GROUP_PARTICIPANT_REMOVED: 'group:participant:removed',
  GROUP_OWNERSHIP_TRANSFERRED: 'group:ownership:transferred',

  NOTIFICATION_NEW: 'notification:new',

  APP_ERROR: 'app:error',
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];
