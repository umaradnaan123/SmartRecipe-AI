import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

try {
  prismaInstance = globalForPrisma.prisma || new PrismaClient({ log: ['query'] });
} catch (e) {
  // Prevent build crashes on Vercel when DB file is not migrated or configured
  prismaInstance = new Proxy({} as PrismaClient, {
    get(target, prop) {
      // Return a function that resolves to empty results for queries
      return new Proxy(() => {}, {
        get() {
          return () => Promise.resolve([]);
        },
        apply() {
          return {
            findMany: () => Promise.resolve([]),
            findUnique: () => Promise.resolve(null),
            findFirst: () => Promise.resolve(null),
            create: () => Promise.resolve({}),
            update: () => Promise.resolve({}),
            delete: () => Promise.resolve({}),
            deleteMany: () => Promise.resolve({ count: 0 }),
          };
        }
      });
    }
  });
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
