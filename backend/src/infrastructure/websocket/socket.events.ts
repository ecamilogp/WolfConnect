import { Server, Socket } from 'socket.io';

export function registerSocketEvents(io: Server): void {
  console.log('📌 registerSocketEvents executed');

  io.on('connection', (socket: Socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${socket.id}`);
    });
  });
}
