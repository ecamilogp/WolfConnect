import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './infrastructure/database/prisma.js';

await prisma.connect();

app.listen(env.PORT, () => {
  console.log(`🚀 WolfConnect API running on http://localhost:${env.PORT}`);
});
