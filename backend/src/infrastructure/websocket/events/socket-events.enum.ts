export const SocketEvents = {
  CONNECTION: 'connection',
  CONNECT: 'connect',
  CONNECT_ERROR: 'connect_error',
  DISCONNECT: 'disconnect',

  // Presencia
  PRESENCE_ONLINE: 'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',

  // Salas de chat
  CHAT_JOIN: 'chat:join',
  CHAT_JOINED: 'chat:joined',
  CHAT_LEAVE: 'chat:leave',
  CHAT_LEFT: 'chat:left',

  // Mensajes
  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  MESSAGE_EDIT: 'message:edit',
  MESSAGE_EDITED: 'message:edited',
  MESSAGE_DELETE: 'message:delete',
  MESSAGE_DELETED: 'message:deleted',

  // Attachments
  ATTACHMENT_UPLOADED: 'attachment:uploaded',

  // Notificaciones
  NOTIFICATION_NEW: 'notification:new',

  // Errores de aplicación (no de transporte). Distinto de "connect_error":
  // este se emite cuando la conexión ya existe pero una acción de negocio falla.
  APP_ERROR: 'app:error',
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];
