import { Server } from 'socket.io';

import { SocketEvents } from '../events/socket-events.enum.js';
import { AuthenticatedSocket } from '../types/authenticated-socket.type.js';
import { PresenceChangedPayload } from '../types/socket-payloads.type.js';

export function registerPresenceHandlers(_io: Server, socket: AuthenticatedSocket): void {
  const payload: PresenceChangedPayload = { userId: socket.data.user.id };

  socket.broadcast.emit(SocketEvents.PRESENCE_ONLINE, payload);

  socket.on(SocketEvents.DISCONNECT, () => {
    socket.broadcast.emit(SocketEvents.PRESENCE_OFFLINE, payload);
  });
}
