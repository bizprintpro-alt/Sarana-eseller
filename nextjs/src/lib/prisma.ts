import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    // Return a proxy that throws helpful errors on any DB call
    // instead of crashing at import time
    return new Proxy({} as PrismaClient, {
      get(_target, prop) {
        if (typeof prop === 'string' && !['then', 'catch', '$connect', '$disconnect'].includes(prop)) {
          return new Proxy({}, {
            get() {
              return async () => { throw new Error('DATABASE_URL тохируулаагүй байна'); };
            },
          });
        }
        return () => {};
      },
    });
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
  globalForPrisma.prisma = prisma;
}
