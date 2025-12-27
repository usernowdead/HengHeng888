import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get database URL with connection pooling support for Vercel
function getDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // For Supabase on Vercel, ensure connection pooling is enabled
  // If the URL doesn't have pgbouncer params and is a Supabase URL, add them
  if (process.env.VERCEL && dbUrl.includes('supabase.co')) {
    // Check if pgbouncer params are already present
    if (!dbUrl.includes('pgbouncer=true')) {
      // Add pgbouncer params if not present
      const separator = dbUrl.includes('?') ? '&' : '?';
      return `${dbUrl}${separator}pgbouncer=true&connection_limit=1`;
    }
  }

  return dbUrl;
}

// Optimized Prisma Client with connection pooling support
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  // Connection pooling is handled by the connection string
  // For Vercel: Use connection pooling URL with ?pgbouncer=true&connection_limit=1
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

