import { createServer } from 'http';

import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './infrastructure/database/prisma.service.js';
import { createSocketServer } from './infrastructure/websocket/socket.server.js';

await prisma.connect();

const httpServer = createServer(app);

// Initialize Socket.IO on the same HTTP server
createSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`🚀 WolfConnect API running on http://localhost:${env.PORT}`);
});

async function shutdown(): Promise<void> {
  await prisma.disconnect();
  httpServer.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
