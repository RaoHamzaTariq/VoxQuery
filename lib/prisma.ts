import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.DEBUG_MODE === 'true' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Helper function to test connection
export async function testConnection() {
  try {
    await prisma.$connect();
    return { success: true, message: 'Database connection successful' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Helper function to disconnect
export async function disconnect() {
  await prisma.$disconnect();
}
