import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

import { socketServerOptions } from './config/socket.config.js';
import { registerHandlers } from './handlers/index.js';
import { socketAuthMiddleware } from './middlewares/socket-auth.middleware.js';
import { SocketEvents } from './events/socket-events.enum.js';
import { AuthenticatedSocket } from './types/authenticated-socket.type.js';
import { logger } from '../../shared/utils/logger.js';

let ioInstance: Server | undefined;

export function userRoom(userId: string): string {
  return `user:${userId}`;
}

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, socketServerOptions);

  ioInstance = io;

  io.use(socketAuthMiddleware);

  io.on(SocketEvents.CONNECTION, (socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;

    logger.info(`🟢 Socket connected: ${authenticatedSocket.data.user.email} (${socket.id})`);

    socket.join(userRoom(authenticatedSocket.data.user.id));

    registerHandlers(io, authenticatedSocket);

    socket.on(SocketEvents.DISCONNECT, (reason) => {
      logger.info(`🔴 Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!ioInstance) {
    throw new Error('Socket.IO server has not been initialized yet.');
  }

  return ioInstance;
}
