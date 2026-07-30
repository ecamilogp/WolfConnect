import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

import { socketServerOptions } from './config/socket.config.js';
import { registerHandlers } from './handlers/index.js';
import { socketAuthMiddleware } from './middlewares/socket-auth.middleware.js';
import { SocketEvents } from './events/socket-events.enum.js';
import { AuthenticatedSocket } from './types/authenticated-socket.type.js';

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, socketServerOptions);

  io.use(socketAuthMiddleware);

  io.on(SocketEvents.CONNECTION, (socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;

    console.log(`🟢 Socket connected: ${authenticatedSocket.data.user.email} (${socket.id})`);

    registerHandlers(io, authenticatedSocket);

    socket.on(SocketEvents.DISCONNECT, (reason) => {
      console.log(`🔴 Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
