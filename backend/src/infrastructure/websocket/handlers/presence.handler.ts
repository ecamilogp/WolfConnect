import { Server } from 'socket.io';

import { SocketEvents } from '../events/socket-events.enum.js';
import { AuthenticatedSocket } from '../types/authenticated-socket.type.js';
import { PresenceChangedPayload, PresenceSnapshotPayload } from '../types/socket-payloads.type.js';
import {
  getOnlineUserIds,
  registerConnection,
  registerDisconnection,
} from '../presence/presence-tracker.js';

export function registerPresenceHandlers(_io: Server, socket: AuthenticatedSocket): void {
  const userId = socket.data.user.id;
  const payload: PresenceChangedPayload = { userId };

  // Tell the newly-connected client who is already online *before*
  // registering its own connection, so it gets an accurate snapshot of
  // everyone else's state instead of a diff-only stream of future events.
  const snapshot: PresenceSnapshotPayload = { onlineUserIds: getOnlineUserIds() };
  socket.emit(SocketEvents.PRESENCE_SNAPSHOT, snapshot);

  const justWentOnline = registerConnection(userId);

  // A user may have several tabs/devices connected at once — only broadcast
  // "online" the first time, not on every extra connection.
  if (justWentOnline) {
    socket.broadcast.emit(SocketEvents.PRESENCE_ONLINE, payload);
  }

  socket.on(SocketEvents.DISCONNECT, () => {
    const justWentOffline = registerDisconnection(userId);

    // Only broadcast "offline" once their last remaining connection drops.
    if (justWentOffline) {
      socket.broadcast.emit(SocketEvents.PRESENCE_OFFLINE, payload);
    }
  });
}
