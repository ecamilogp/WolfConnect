import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

import { socketServerOptions } from './config/socket.config.js';
import { registerHandlers } from './handlers/index.js';
import { socketAuthMiddleware } from './middlewares/socket-auth.middleware.js';
import { SocketEvents } from './events/socket-events.enum.js';
import { AuthenticatedSocket } from './types/authenticated-socket.type.js';

let ioInstance: Server | undefined;

/**
 * Sala personal de un usuario -- todos sus sockets (puede tener varias
 * pestañas/dispositivos abiertos) se unen acá al conectarse. Permite
 * emitirle algo a "el usuario X" sin importar en qué chats esté, útil para
 * notificaciones que no pertenecen a una sala de chat concreta.
 */
export function userRoom(userId: string): string {
  return `user:${userId}`;
}

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, socketServerOptions);

  ioInstance = io;

  io.use(socketAuthMiddleware);

  io.on(SocketEvents.CONNECTION, (socket) => {
    const authenticatedSocket = socket as AuthenticatedSocket;

    console.log(`🟢 Socket connected: ${authenticatedSocket.data.user.email} (${socket.id})`);

    socket.join(userRoom(authenticatedSocket.data.user.id));

    registerHandlers(io, authenticatedSocket);

    socket.on(SocketEvents.DISCONNECT, (reason) => {
      console.log(`🔴 Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}

/**
 * Punto de acceso a la instancia de Socket.IO para código que no es un
 * socket handler -- por ejemplo un controller REST que necesita emitir un
 * evento después de guardar algo (attachments, notificaciones, etc.).
 * Mismo patrón que `export const prisma` en `prisma.service.ts`: un único
 * punto de acceso, sin contenedor de DI.
 */
export function getIO(): Server {
  if (!ioInstance) {
    throw new Error('Socket.IO server has not been initialized yet.');
  }

  return ioInstance;
}
