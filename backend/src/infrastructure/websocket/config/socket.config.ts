import { ServerOptions } from 'socket.io';

import { env } from '../../../config/env.js';

export const socketServerOptions: Partial<ServerOptions> = {
  cors: {
    origin: env.SOCKET_CORS_ORIGIN,
    // 'credentials: true' + origin '*' es una combinación inválida según la
    // spec de CORS (los navegadores la rechazan si el cliente envía
    // credenciales). Solo se activa cuando hay un origin explícito
    // configurado vía SOCKET_CORS_ORIGIN.
    credentials: env.SOCKET_CORS_ORIGIN !== '*',
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 20000,
  pingInterval: 25000,
};
