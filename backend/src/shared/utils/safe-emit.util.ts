import { getIO } from '../../infrastructure/websocket/socket.server.js';

/**
 * Emits a socket event to a room, swallowing and logging any failure
 * (including the socket server not being initialized yet) so a broadcast
 * problem never breaks the HTTP request that triggered it.
 */
export function safeEmit<T>(room: string, event: string, payload: T, logTag: string): void {
  try {
    getIO().to(room).emit(event, payload);
  } catch (error) {
    console.error(`[${logTag}:socket-emit-failed]`, error);
  }
}
