import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

import { registerSocketEvents } from './socket.events.js';
import { socketAuthMiddleware } from './middlewares/socket-auth.middleware.js';
import { SocketManager } from './socket.manager.js';

export function createSocketServer(server: HttpServer): Server {
  console.log('🚀 Creating Socket.IO server');

  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  console.log('✅ Registering socket events');

  SocketManager.initialize(io);

  io.use(socketAuthMiddleware);

  registerSocketEvents(io);

  return io;
}
