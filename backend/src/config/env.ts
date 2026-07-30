import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required.');
}

export const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  // Origen(es) permitido(s) para el handshake de Socket.IO. Acepta una lista
  // separada por comas (ej. "https://app.wolfconnect.com,https://admin.wolfconnect.com").
  // Sin definir, cae a '*' solo como fallback de desarrollo — nunca usar '*' en producción.
  SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN
    ? process.env.SOCKET_CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : '*',
} as const;
