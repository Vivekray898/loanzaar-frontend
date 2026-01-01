import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = (global as any).__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') (global as any).__prisma = prisma;
