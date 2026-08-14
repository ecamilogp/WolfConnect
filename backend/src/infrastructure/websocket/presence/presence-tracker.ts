/**
 * In-memory presence tracker. A user can have multiple simultaneous socket
 * connections (several tabs/devices), so we track a connection count per
 * user instead of a single boolean — the user is only reported "offline"
 * once their last connection drops, and "online" only on their first one.
 */
const onlineUserConnections = new Map<string, number>();

/**
 * Registers a new connection for the user. Returns true if this is the
 * user's first active connection (i.e. they just transitioned to online).
 */
export function registerConnection(userId: string): boolean {
  const current = onlineUserConnections.get(userId) ?? 0;

  onlineUserConnections.set(userId, current + 1);

  return current === 0;
}

/**
 * Registers a dropped connection for the user. Returns true if this was
 * their last active connection (i.e. they just transitioned to offline).
 */
export function registerDisconnection(userId: string): boolean {
  const current = onlineUserConnections.get(userId) ?? 0;

  if (current <= 1) {
    onlineUserConnections.delete(userId);
    return true;
  }

  onlineUserConnections.set(userId, current - 1);
  return false;
}

export function getOnlineUserIds(): string[] {
  return Array.from(onlineUserConnections.keys());
}

export function isUserOnline(userId: string): boolean {
  return onlineUserConnections.has(userId);
}
