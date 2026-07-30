import { Server } from 'socket.io';

import { AuthenticatedSocket } from '../types/authenticated-socket.type.js';
import { registerChatHandlers } from './chat.handler.js';
import { registerPresenceHandlers } from './presence.handler.js';

export function registerHandlers(io: Server, socket: AuthenticatedSocket): void {
  registerPresenceHandlers(io, socket);
  registerChatHandlers(io, socket);
}
