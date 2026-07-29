import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

import { registerSocketEvents } from './socket.events.js';

export function createSocketServer(server: HttpServer): Server {
  console.log('🚀 Creating Socket.IO server');

  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  console.log('✅ Registering socket events');

  registerSocketEvents(io);

  return io;
}
