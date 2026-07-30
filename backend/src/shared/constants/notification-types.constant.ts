/**
 * Valores válidos para `Notification.type`. Es un `String` libre en Prisma
 * (no un enum de Postgres) para poder agregar tipos nuevos sin migración --
 * estas constantes son la única fuente de verdad en código.
 */
export const NotificationType = {
  GROUP_INVITATION: 'GROUP_INVITATION',
  GROUP_INVITATION_ACCEPTED: 'GROUP_INVITATION_ACCEPTED',
  GROUP_INVITATION_REJECTED: 'GROUP_INVITATION_REJECTED',
  GROUP_MEMBER_JOINED: 'GROUP_MEMBER_JOINED',
} as const;
