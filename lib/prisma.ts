import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

// Lazy initialization — PrismaClient is not created until first access.
// During Next.js build's "Collecting page data" phase, the module is loaded
// but PrismaClient construction is deferred until a query is actually made.
function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy<PrismaClient>({} as PrismaClient, {
  get(_, prop: string | symbol) {
    // Ensure we don't look Promise-like
    if (prop === 'then' || prop === 'catch' || prop === 'finally') {
      return undefined;
    }
    return (getPrisma() as any)[prop];
  },
  set(_, prop: string | symbol, value: any) {
    (getPrisma() as any)[prop] = value;
    return true;
  },
});

export default prisma;
