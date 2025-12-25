import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Optimized Prisma Client with connection pooling support
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  // Connection pooling is handled by the connection string
  // For Vercel: Use connection pooling URL with ?pgbouncer=true&connection_limit=1
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

