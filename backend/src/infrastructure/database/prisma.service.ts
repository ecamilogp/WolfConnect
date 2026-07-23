import { PrismaClient } from '@prisma/client';

class PrismaService extends PrismaClient {
  async connect() {
    await this.$connect();
    console.log(`✅ prisma connected`);
  }

  async disconnect() {
    await this.$disconnect();
    console.log(`🛑 prisma disconnected`);
  }
}

export const prisma = new PrismaService();
