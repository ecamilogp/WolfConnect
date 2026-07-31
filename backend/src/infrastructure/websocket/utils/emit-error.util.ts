import { Socket } from 'socket.io';

import { AppError } from '../../../shared/errors/app-error.js';
import { logger } from '../../../shared/utils/logger.js';
import { SocketEvents } from '../events/socket-events.enum.js';
import { AppErrorPayload } from '../types/socket-payloads.type.js';

export function emitSocketError(socket: Socket, error: unknown): void {
  logger.error('[socket:error]', error);

  const payload: AppErrorPayload =
    error instanceof AppError
      ? { code: error.name, message: error.message }
      : { code: 'INTERNAL_ERROR', message: 'Something went wrong.' };

  socket.emit(SocketEvents.APP_ERROR, payload);
}
