import { Server } from 'socket.io';

export class SocketManager {
  private static io: Server;

  static initialize(io: Server): void {
    SocketManager.io = io;
  }

  static getIO(): Server {
    return SocketManager.io;
  }
}
